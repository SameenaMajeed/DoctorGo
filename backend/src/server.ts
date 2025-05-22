import express, { Application } from 'express';
import { createServer, Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import 'dotenv/config';
import { connectDB } from './database/Db';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from "path";
import { initializeSocket } from "./socket";

// Import routes
import userRoute from './routes/userRoute/userRoutes';
import otpRoute from './routes/commonRoute/OtpRoutes';
import doctorRoute from './routes/doctorRoute/doctorRoutes';
import adminRoute from './routes/adminRoute/adminRoutes';
import slotRoute from './routes/commonRoute/slotRoutes';

dotenv.config();

// Initialize Express app and HTTP server
const app: Application = express();
const httpServer: HttpServer = createServer(app);
export const io: SocketIOServer = initializeSocket(httpServer); 

// DB connection
connectDB();

// ✅ Corrected CORS Configuration
const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Fixed spelling mistake
    credentials: true, // Corrected typo (was `Credential`)
};

// Apply middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

console.log('Server is starting...');

// Routes
app.use('/api/users', userRoute);
app.use('/api/users/otp', otpRoute);
app.use('/api/doctor', doctorRoute);
app.use('/api/admin' , adminRoute)
app.use('/api/slots',slotRoute)

// Catch-all route for 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Test route to verify server is running
app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.set("io", io);

// Start server
const PORT: number | string = process.env.PORT || 5000;

httpServer.listen(PORT, (error?: Error) => {
    if (!error) {
        console.log(`Server running at: http://localhost:${PORT}`);
    } else {
        console.error("Server Error:", error.message);
    }
});