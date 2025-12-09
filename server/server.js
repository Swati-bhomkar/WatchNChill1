// server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './configs/db.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import favoriteRouter from './routes/favoriteRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';

const app = express();
const port = 3000;

await connectDB();

// Stripe test route
app.get('/api/stripe/test', (req, res) => {
  console.log('🔥 GET /api/stripe/test HIT');
  res.send('stripe test ok');
});

// Stripe webhooks
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// JSON + CORS (after webhook)
app.use(express.json({ limit: '5mb' })); // allow base64 images
app.use(cors());

// Optional static if you still need it
app.use("/uploads", express.static("uploads"));

app.get('/', (req, res) => res.send('Server is Live'));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/movie', movieRoutes);
app.use('/api/favorite', favoriteRouter);

/* ---------------------- REGISTER ---------------------- */
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      _id: email,
      name,
      email,
      password: hashedPassword,
      image: "default.jpg",
      role: "user",
    });

    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- LOGIN ---------------------- */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    // Simple token = user._id (email)
    const token = user._id;

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image, // 👈 will be "default.jpg" or base64
        city: user.city,
        phone: user.phone,
        favoriteGenres: user.favoriteGenres,
        preferredLanguage: user.preferredLanguage,
        gender: user.gender,
        about: user.about,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);
