
# CloudBin - File Storage and Management Web App

CloudBin is a cloud-based file management and storage platform, allowing users to securely upload, store, and manage files with ease. Built using HTML, CSS, and JavaScript for the frontend and Node.js, Express.js, and MongoDB for the backend, CloudBin ensures a seamless and efficient user experience for managing files from any device.

## Features

- **User Authentication**: Secure login and registration for personalized user experience.
- **File Upload & Storage**: Allows multi-format file uploads with encrypted storage.
- **File Management**: View, open, and organize files within a simple, intuitive UI.
- **Real-Time Sync**: Cloud-based synchronization for easy access across devices.
- **Responsive Design**: Optimized for mobile and desktop views.
- **Secure Storage**: Password hashing with bcrypt and secure data storage using MongoDB.
- **QR Code Sharing**: Generate QR codes for easy file sharing.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## Installation and Setup

### Prerequisites

- **Node.js**: v14+ is recommended. [Download Node.js here](https://nodejs.org/)
- **MongoDB**: A MongoDB instance, either local or cloud (MongoDB Atlas is recommended).

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/cloudbin.git
   cd cloudbin
   ```

2. **Run Server**
   ```
   node server.js
   ```

4. **Access CloudBin**
   - Open your browser and go to `http://localhost:3000`.

## Project Structure

- **/public**: Contains static files (CSS, JavaScript, images).
- **/views**: Contains HTML templates for each page.
- **/routes**: Handles different application routes (e.g., `/login`, `/upload`).
- **/models**: MongoDB schemas for storing user and file data.
- **/controllers**: Logic for handling authentication, file upload, and management.

## Key Modules Used

- **Mongoose**: Manages MongoDB data with schema and model support.
- **Express.js**: Framework for routing and server management.
- **Bcryptjs**: Hashes passwords for secure user authentication.
- **Multer**: Manages file uploads.
- **QRCode**: Generates QR codes for sharing links to files.

## Usage

1. **Sign Up**: Create an account or log in if you already have one.
2. **Upload Files**: Go to the upload page and select files to store in your CloudBin.
3. **View & Manage Files**: Access uploaded files, view details, and download or delete them as needed.
4. **Generate QR Code**: Generate a QR code for easy sharing of files with others.

## Future Enhancements

- **Version Control**: Track changes to files over time.
- **Collaboration Features**: Enable sharing and collaborative editing.
- **Advanced Security**: Implement two-factor authentication.


---
