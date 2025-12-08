// server/utils/emails.js
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.warn('⚠️ RESEND_API_KEY is not set. Emails will fail.');
}
const resend = new Resend(resendApiKey);

/**
 * sendBookingEmail via Resend
 * @param {Object} user - user document { email, name }
 * @param {Object} booking - booking document { bookedSeats: [], amount, _id }
 * @param {Object} show - show document { showDateTime, movie: { title } }
 */
export const sendBookingEmail = async (user, booking, show) => {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  if (!user?.email) {
    throw new Error('No recipient email provided');
  }

  const seatList = Array.isArray(booking.bookedSeats) ? booking.bookedSeats.join(', ') : booking.bookedSeats || '';
  const dateTime = show?.showDateTime
    ? new Date(show.showDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  const subject = `🎬 Booking Confirmed – ${show?.movie?.title || 'Your Movie'}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>Booking Confirmed ✅</h2>
      <p>Hi ${user.name || ''},</p>
      <p>Your ticket has been booked successfully. Details below:</p>
      <ul>
        <li><strong>Movie:</strong> ${show?.movie?.title || ''}</li>
        <li><strong>Date & Time:</strong> ${dateTime}</li>
        <li><strong>Seats:</strong> ${seatList}</li>
        <li><strong>Amount Paid:</strong> ₹${booking.amount}</li>
      </ul>
      <p>Booking ID: ${booking._id}</p>
      <p>Enjoy the show! 🍿</p>
    </div>
  `;

  // Simple retry helper (2 attempts total)
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`📧 Resend: sending attempt ${attempt} to ${user.email}`);
      const res = await resend.emails.send({
        from: process.env.RESEND_FROM || process.env.SEND_FROM || 'no-reply@yourdomain.com',
        to: user.email,
        subject,
        html,
      });
      console.log('✅ Resend send result:', res);
      return res;
    } catch (err) {
      console.error(`❌ Resend send error (attempt ${attempt}):`, err?.message || err);
      if (attempt === maxAttempts) throw err;
      // small delay before retry (simple backoff)
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
};
