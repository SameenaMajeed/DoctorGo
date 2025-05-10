import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authenticateToken = (requiredRole?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token =
        req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

      if (!token) {
        console.error("Access token is missing or invalid");
        res.status(401).json({ message: "Access token is missing or invalid" });
        return;
      }

      const decoded = verifyToken(token);
      if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
        console.error("Invalid or expired token:", decoded);
        res.status(401).json({ message: "Invalid or expired token" });
        return;
      }

      console.log("Decoded token:", decoded);

      req.data = {
        id: decoded.id,
        role: decoded.role.toLowerCase(), // Normalize role case
        email: decoded.email,
      } as {
        id: string;
        role: string;
        userId?: string;
        email: string;
      };

      console.log("User attached to request:", req.data);

      if (requiredRole && decoded.role !== requiredRole) {
        console.error(
          `Forbidden: Role mismatch. Required: ${requiredRole}, Found: ${decoded.role}`
        );
        res
          .status(403)
          .json({
            message: `Forbidden: Required role is ${requiredRole}, but found ${decoded.role}`,
          });
        return;
      }

      next();
    } catch (error: any) {
      console.error("Token Authentication Error:", error.message);
      res
        .status(401)
        .json({ message: "Authentication failed", error: error.message });
    }
  };
};
