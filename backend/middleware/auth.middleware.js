import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "user not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      console.log("Error in protect route middleware", error.message);
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.log("Error in protect route middleware", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const adminRoute = async (req, res, next) => {
  try {
    if (req.user && req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    console.log("Error in admin route middleware", error.message);
    res.status(500).json({ message: error.message });
  }
};
