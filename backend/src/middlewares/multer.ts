import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads' ); 
    console.log('Setting upload destination to:', uploadPath);

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      console.log('Directory does not exist. Creating:', uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);  
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});

// File filter to allow only images
const fileFilter = (req: any, file: any, cb: any) => {
  console.log('Checking file mimetype:', file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    console.log('File is an image. Accepting upload.');
    cb(null, true);
  } else {
    console.error('File is not an image. Rejecting upload.');
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

console.log('Multer configuration completed');
export default upload;


// import multer, { FileFilterCallback } from "multer";
// import path from "path";
// import fs from "fs";
// import { Request } from "express";

// // Define the upload directory
// const UPLOAD_DIR = path.join(__dirname, "../uploads");

// // Ensure the upload directory exists at startup
// if (!fs.existsSync(UPLOAD_DIR)) {
//   console.log("Upload directory does not exist. Creating:", UPLOAD_DIR);
//   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// }

// // Configure storage for uploaded files
// const storage = multer.diskStorage({
//   destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
//     cb(null, UPLOAD_DIR);
//   },
//   filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     const filename = `${uniqueSuffix}-${file.originalname}`;
//     console.log("Generated filename:", filename);
//     cb(null, filename);
//   },
// });

// // Allowed file types (images & PDFs)
// const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

// // File filter function
// const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//   console.log("Checking file mimetype:", file.mimetype);

//   if (allowedMimeTypes.includes(file.mimetype)) {
//     console.log("File is allowed. Accepting upload.");
//     cb(null, true);
//   } else {
//     console.error("File is not allowed. Rejecting upload.");
//     cb(new Error("Only images (JPG, PNG, GIF) and PDFs are allowed"));
//   }
// };

// // Multer configuration with limits
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB file size limit
//   },
// });

// console.log("Multer configuration completed ✅");
// export default upload;

