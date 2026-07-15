import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error(`Error generating tokens: ${error.message}`);
  }
};

// POST /auth/register -- User Register Controller 
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    return res.status(409).json({
      success: false,
      message: "User with this email already exists",
    });
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const user = await User.create({
    name,
    email,
    password,
    avatar: avatar?.url || "",
    role: "member",
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering the user",
    });
  }
 const options = { httpOnly: true, secure: true };
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      data: createdUser,
    });
});

// POST /auth/login -- User Login Controller

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ success: false, message: "Invalid email" });

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch)
    return res
      .status(401)
      .json({ success: false, message: "Incorrect password" });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      message: "Logged in successfully",
      data: loggedInUser,
      accessToken,
      refreshToken,
    });
});

// GET /auth/me -- just return the logged-in user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json({
        success: true,
        data: req.user   
    });
});

// GET /auth/me -- Update allowed fields only
const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address } = req.body;  // never let user update role/email here

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { name, phone, address } },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser
    });
});

// POST /auth/logout -- Logout User Controller
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ success: true, message: "User logged out" });
});

// POST /auth/refresh-token -- Get new refresh token controller
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken)
    return res.status(401).json({ message: "Unauthorized request" });

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user)
      return res.status(401).json({ message: "Invalid refresh token" });

    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({ message: "Refresh token expired or used" });
    } else {
      const options = { httpOnly: true, secure: true };
      const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshTokens(user._id);
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json({
          message: "Access token refreshed",
          accessToken,
          refreshToken: newRefreshToken,
        });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: error?.message || "Invalid refresh token" });
  }
});

// PUT /auth/change-password -- Change current user password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message:"Current password and new password are required"
    })
  }

  const user = await User.findById(req.user._id);

  const isMatch = await user.isPasswordCorrect(currentPassword)
  if (!isMatch) {
     return res.status(401).json({
            success: false,
            message: "Current password is incorrect"
        });
  }

  user.password = newPassword
  await user.save()

  return res.status(200).json({
        success: true,
        message: "Password changed successfully"
    });
  
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  changePassword
};
