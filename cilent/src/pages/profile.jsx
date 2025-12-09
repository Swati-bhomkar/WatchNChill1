// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, setUser, axios, navigate, logout } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [avatarData, setAvatarData] = useState(''); // base64 string

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    phone: '',
    favoriteGenres: '',
    preferredLanguage: '',
    gender: '',
    about: '',
  });

  // 🔹 On first mount: redirect if not logged in, else fetch latest profile
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/user/profile');
        if (data.success && data.user) {
          setUser(data.user); // updates context + localStorage
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile details');
      }
    };

    fetchProfile();
  }, []); // run once

  // 🔹 When user in context is updated, sync to form
  useEffect(() => {
    if (user) {
      const filledData = {
        name: user.name || '',
        email: user.email || '',
        city: user.city || '',
        phone: user.phone || '',
        favoriteGenres: user.favoriteGenres || '',
        preferredLanguage: user.preferredLanguage || '',
        gender: user.gender || '',
        about: user.about || '',
      };

      setFormData(filledData);

      // if user.image is not default.jpg, use it; else use null (will fallback to assets.profiles)
      if (user.image && user.image !== 'default.jpg') {
        setPreviewImage(user.image); // base64 / URL
      } else {
        setPreviewImage(null);
      }

      // If important fields missing, auto-enable edit
      if (!user.city || !user.preferredLanguage) {
        setIsEditing(true);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Convert selected avatar file to Base64 and store in state
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result; // data:image/...;base64,...
      setAvatarData(base64String);
      setPreviewImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel → reset to original user data
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          city: user.city || '',
          phone: user.phone || '',
          favoriteGenres: user.favoriteGenres || '',
          preferredLanguage: user.preferredLanguage || '',
          gender: user.gender || '',
          about: user.about || '',
        });

        if (user.image && user.image !== 'default.jpg') {
          setPreviewImage(user.image);
        } else {
          setPreviewImage(null);
        }
        setAvatarData('');
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        phone: formData.phone,
        favoriteGenres: formData.favoriteGenres,
        preferredLanguage: formData.preferredLanguage,
        gender: formData.gender,
        about: formData.about,
      };

      if (avatarData) {
        // override existing DB image
        payload.image = avatarData;
      }

      const { data } = await axios.put('/api/user/profile', payload);

      if (data.success && data.user) {
        setUser(data.user); // sync context + localStorage
        setIsEditing(false);
        toast.success(data.message || 'Profile updated successfully');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while saving your profile.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-zinc-300 text-lg">Please login to view your profile.</p>
      </div>
    );
  }

  const displayedImage = previewImage || assets.profiles;

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-8 lg:px-24 bg-[#09090B]">
      <div className="max-w-4xl mx-auto border border-zinc-800 rounded-3xl bg-zinc-900/70 backdrop-blur p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8">
          {/* Avatar */}
          <div className="relative">
            <img
              src={displayedImage}
              alt="Profile"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-primary shadow-lg"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dull text-white text-xs px-3 py-1 rounded-full cursor-pointer shadow-md">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Name / Email / Buttons */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              {formData.name || 'Your Name'}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">{formData.email}</p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              <button
                type="button"
                onClick={handleToggleEdit}
                className="px-5 py-2 rounded-full bg-primary hover:bg-primary-dull text-sm font-medium text-white transition"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/my-bookings')}
                className="px-5 py-2 rounded-full bg-primary hover:bg-primary-dull text-sm font-medium text-white transition"
              >
                My Bookings
              </button>

              <button
                type="button"
                onClick={logout}
                className="px-5 py-2 rounded-full bg-primary hover:bg-primary-dull text-sm font-medium text-white transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
        >
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-400">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              disabled={!isEditing}
              onChange={handleChange}
              className={`h-11 rounded-full px-4 bg-zinc-900 border text-sm outline-none ${
                isEditing
                  ? 'border-zinc-700 text-zinc-100'
                  : 'border-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Email (read only) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-400">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="h-11 rounded-full px-4 bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 cursor-not-allowed outline-none"
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-400">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              disabled={!isEditing}
              onChange={handleChange}
              className={`h-11 rounded-full px-4 bg-zinc-900 border text-sm outline-none ${
                isEditing
                  ? 'border-zinc-700 text-zinc-100'
                  : 'border-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-400">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              disabled={!isEditing}
              onChange={handleChange}
              className={`h-11 rounded-full px-4 bg-zinc-900 border text-sm outline-none ${
                isEditing
                  ? 'border-zinc-700 text-zinc-100'
                  : 'border-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Favourite Genres */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm text-zinc-400">
              Favourite Genres (e.g. Action, Romance, Thriller)
            </label>
            <input
              type="text"
              name="favoriteGenres"
              value={formData.favoriteGenres}
              disabled={!isEditing}
              onChange={handleChange}
              className={`h-11 rounded-full px-4 bg-zinc-900 border text-sm outline-none ${
                isEditing
                  ? 'border-zinc-700 text-zinc-100'
                  : 'border-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Preferred Language */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-400">Preferred Language</label>
            <input
              type="text"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              disabled={!isEditing}
              onChange={handleChange}
              className={`h-11 rounded-full px-4 bg-zinc-900 border text-sm outline-none ${
                isEditing
                  ? 'border-zinc-700 text-zinc-100'
                  : 'border-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-400">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              disabled={!isEditing}
              onChange={handleChange}
              className={`h-11 rounded-full px-4 bg-zinc-900 border text-sm outline-none ${
                isEditing
                  ? 'border-zinc-700 text-zinc-100'
                  : 'border-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_say">Prefer not to say</option>
            </select>
          </div>

          {/* About */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm text-zinc-400">
              Other Details / About You
            </label>
            <textarea
              name="about"
              rows={3}
              value={formData.about}
              disabled={!isEditing}
              onChange={handleChange}
              className={`rounded-2xl px-4 py-3 bg-zinc-900 border text-sm resize-none outline-none ${
                isEditing
                  ? 'border-zinc-700 text-zinc-100'
                  : 'border-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
              placeholder="Tell us a bit about your movie taste, favourite actors, etc."
            />
          </div>

          {/* Save button */}
          {isEditing && (
            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-primary hover:bg-primary-dull text-white text-sm font-medium transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;





