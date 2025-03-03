// import multer from "multer";
// import cloudinary from "../config/cloudinary";

// // Configure multer to use memory storage (files are stored in memory, not on disk)
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Function to upload files to Cloudinary
// const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream({ resource_type: "auto" }, (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload error:", error);
//           reject(error);
//         } else {
//           resolve(result?.secure_url || ""); // Return the secure URL of the uploaded file
//         }
//       })
//       .end(file.buffer); // Pass the file buffer to Cloudinary
//   });
// };

// export { upload, uploadToCloudinary };


import multer from "multer";
import path from "path";
import fs from "fs";

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      console.log("Directory does not exist. Creating:", uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

// File filter to allow only images
const fileFilter = (req: any, file: any, cb: any) => {
  console.log("Checking file mimetype:", file.mimetype);

  if (file.mimetype.startsWith("image/")) {
    console.log("File is an image. Accepting upload.");
    cb(null, true);
  } else {
    console.error("File is not an image. Rejecting upload.");
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

console.log("Multer configuration completed");
export default upload;
