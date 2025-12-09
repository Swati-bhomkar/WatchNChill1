// controllers/userController.js
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// Get bookings for a user
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.body;

    const bookings = await Booking.find({
      user: userId,
      isCancelled: false,
    })
      .populate({ path: 'show', populate: { path: 'movie' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

// Update profile, including image (as base64) in `image` field
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // from protectUser

    const fields = [
      'name',
      'city',
      'phone',
      'favoriteGenres',
      'preferredLanguage',
      'gender',
      'about',
      'image', // base64 image from frontend
    ];

    const updateData = {};
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

