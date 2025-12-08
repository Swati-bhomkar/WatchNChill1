// server/utils/emails.js
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  console.warn('SendGrid API key not set. Email sending will fail.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * sendBookingEmail via SendGrid
 * @param {Object} user - user doc
 * @param {Object} booking - booking doc
 * @param {Object} show - show doc (should include movie.title and showDateTime)
 */
export const sendBookingEmail = async (user, booking, show) => {
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  const seatList = Array.isArray(booking.bookedSeats) ? booking.bookedSeats.join(', ') : booking.bookedSeats;
  const dateTime = show?.showDateTime
    ? new Date(show.showDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  const subject = `Your booking is confirmed – ${show?.movie?.title || 'Movie'}`;
  const html = `
    <h2>Booking Confirmed ✅</h2>
    <p>Hi ${user.name || ''},</p>
    <p>Your ticket has been booked successfully.</p>
    <ul>
      <li><strong>Movie:</strong> ${show?.movie?.title || ''}</li>
      <li><strong>Date & Time:</strong> ${dateTime}</li>
      <li><strong>Seats:</strong> ${seatList}</li>
      <li><strong>Amount Paid:</strong> ₹${booking.amount}</li>
    </ul>
    <p>Enjoy your show! 🍿</p>
  `;

  const msg = {
    to: user.email,
    from: process.env.SENDGRID_FROM || process.env.SMTP_USER, // verified sender
    subject,
    html,
  };

  console.log('📧 Sending email via SendGrid to:', user.email);
  const result = await sgMail.send(msg);
  console.log('✅ SendGrid response:', result && result[0] && result[0].statusCode);
  return result;
};
