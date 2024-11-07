const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode'); 
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from uploads directory

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/loginSystem', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process on failure
});

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// File Schema
const fileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: String,
    filepath: String,
    qrCodePath: String,
    uploadDate: { type: Date, default: Date.now },
});

const File = mongoose.model('File', fileSchema);

// Routes
// Upload Route
app.post('/upload', upload.single('file'), async (req, res) => {
    const { userId } = req.body;
    if (!req.file) return res.status(400).send('No file uploaded.');

    try {
        const filePath = `/uploads/${req.file.filename}`;
        const qrCodePath = path.join(uploadDir, `${req.file.filename}.png`); // Path for QR code image

        // Generate QR code for the uploaded file URL
        await QRCode.toFile(qrCodePath, `http://localhost:${PORT}${filePath}`); // Adjust for production URL

        const newFile = new File({
            userId,
            filename: req.file.originalname,
            filepath: filePath,
            qrCodePath: `/uploads/${req.file.filename}.png`, // Store relative path of QR code
        });
        await newFile.save();
        res.send(`File uploaded successfully! <br> <img src="${newFile.qrCodePath}" alt="QR Code" />`); // Send back QR code image
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already in use.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.redirect('/'); // Redirect to login after successful signup
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Invalid email or password');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid email or password');

        res.redirect(`/upload.html?userId=${user._id}`); // Redirect to upload page with user ID
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error during login');
    }
});

// File Upload Route
app.post('/upload', upload.single('file'), async (req, res) => {
    const { userId } = req.body;
    if (!req.file) return res.status(400).send('No file uploaded.');

    try {
        const newFile = new File({
            userId,
            filename: req.file.originalname,
            filepath: `/uploads/${req.file.filename}`,
        });
        await newFile.save();
        res.send('File uploaded successfully!');
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
});
// Rename File Route
app.put('/files/:id', async (req, res) => {
    const { id } = req.params;
    const { newFilename } = req.body;

    try {
        // Find the file in the database
        const file = await File.findById(id);
        if (!file) return res.status(404).send('File not found');

        // Update the filename in the database
        file.filename = newFilename;
        await file.save();

        // Rename the actual file on the filesystem
        const oldFilePath = path.join(uploadDir, file.filename);
        const newFilePath = path.join(uploadDir, newFilename);
        fs.rename(oldFilePath, newFilePath, (err) => {
            if (err) {
                console.error('Error renaming file:', err);
                return res.status(500).send('Error renaming file');
            }
            res.send('File renamed successfully');
        });
    } catch (error) {
        console.error('Error renaming file:', error);
        res.status(500).send('Error renaming file');
    }
});
// Function to delete a file
function deleteFile(fileId) {
    fetch(`/files/${fileId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
    })
    .then(message => {
        alert(message); // Show success message
        location.reload(); // Reload the page to refresh the file list
    })
    .catch(error => console.error('Error deleting file:', error));
}
// Delete File Route
app.delete('/files/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Find the file in the database
        const file = await File.findById(id);
        if (!file) return res.status(404).send('File not found');

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, 'uploads', path.basename(file.filepath));
        fs.unlink(filePath, async (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).send('Error deleting file');
            }

            // Remove the file record from the database
            await File.deleteOne({ _id: id });
            res.send('File deleted successfully');
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).send('Error deleting file');
    }
});
// Retrieve User Files
app.get('/files', async (req, res) => {
    const { userId } = req.query;
    try {
        const files = await File.find({ userId });
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).send('Error fetching files');
    }
});

// Serve HTML Files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve upload.html directly when requested 
app.get('/upload.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
