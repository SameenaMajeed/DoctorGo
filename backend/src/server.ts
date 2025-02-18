import express, { Express } from 'express';
import 'dotenv/config';
import { connectDB } from './database/Db';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Import routes
import userRoute from './routes/userRoutes';
import otpRoute from './routes/OtpRoutes';

const app: Express = express();

// DB connection
connectDB();

// ✅ Corrected CORS Configuration
const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Fixed spelling mistake
    credentials: true, // ✅ Corrected typo (was `Credential`)
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

// Start server
const PORT: number | string = process.env.PORT || 5000;

app.listen(PORT, (error?: Error) => {
    if (!error) {
        console.log(`Server running at: http://localhost:${PORT}`);
    } else {
        console.error("Server Error:", error.message);
    }
});
