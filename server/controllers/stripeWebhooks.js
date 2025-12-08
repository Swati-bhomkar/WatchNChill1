// server/controllers/stripeWebhooks.js
import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import { sendBookingEmail } from '../utils/emails.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      console.log('🔔 checkout.session.completed for bookingId:', bookingId);

      if (!bookingId) return res.json({ received: true });

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.error('Booking not found for ID:', bookingId);
        return res.json({ received: true });
      }

      // Idempotency: if already paid, skip re-processing
      if (!booking.isPaid) {
        booking.isPaid = true;
        await booking.save();
        console.log('💰 Booking marked as paid:', booking._id);

        // Mark seats as occupied
        const show = await Show.findById(booking.show).populate('movie');
        if (show) {
          if (!show.occupiedSeats) show.occupiedSeats = new Map();
          booking.bookedSeats.forEach((seat) => show.occupiedSeats.set(seat, true));
          await show.save();
          console.log('🎫 Seats marked occupied for show:', show._id);
        }
      } else {
        console.log('Booking already marked paid, skipping seat/email updates.');
      }

      // Send email (attempt even if booking was already paid — you can toggle behavior)
      const user = await User.findById(booking.user);
      if (user?.email) {
        console.log('➡ Reached sendBookingEmail for booking:', booking._id);
        try {
          await sendBookingEmail(user, booking, await Show.findById(booking.show).populate('movie'));
          console.log('✅ Booking email sent to:', user.email);
        } catch (mailErr) {
          // Log and continue: webhook should still return 200 so Stripe stops retries
          console.error('❌ Error sending booking email:', mailErr);
        }
      } else {
        console.error('User not found or no email for booking:', booking._id);
      }
    }

    // handle other event types if needed...
    res.json({ received: true });
  } catch (err) {
    // Catch any unexpected error so webhook returns 500 and Stripe may retry
    console.error('Webhook handler error:', err);
    res.status(500).send('Server error');
  }
};
