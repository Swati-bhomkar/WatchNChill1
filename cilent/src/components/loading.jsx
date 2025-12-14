// src/pages/LoadingMyBookings.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Loading = () => {
  const { nextUrl } = useParams();
  const navigate = useNavigate();
  const { axios, getToken, user } = useAppContext();
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!nextUrl || !user) {
      // If no nextUrl or no user, redirect after 8 seconds
      setTimeout(() => {
        navigate('/' + (nextUrl || 'my-bookings'));
      }, 8000);
      return;
    }

    const pollBookings = async () => {
      try {
        const { data } = await axios.post('/api/user/booking', {
          userId: await getToken(),
        });
        if (data.success && data.bookings.length > 0) {
          // Check if the most recent booking is paid
          const mostRecentBooking = data.bookings[0]; // sorted by createdAt desc
          if (mostRecentBooking.isPaid) {
            setPolling(false);
            navigate('/' + nextUrl);
            return;
          }
        }
      } catch (error) {
        console.error('Error polling bookings:', error);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollBookings, 2000);

    // Fallback: redirect after 30 seconds regardless
    const fallbackTimeout = setTimeout(() => {
      setPolling(false);
      navigate('/' + nextUrl);
    }, 30000);

    // Initial poll
    pollBookings();

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimeout);
    };
  }, [nextUrl, navigate, axios, getToken, user]);

  return (
    <div className="flex flex-col justify-center items-center h-[80vh]">
      <div className='animate-spin rounded-full h-14 w-14 border-2 border-t-primary mb-4'></div>
      <p className="text-gray-600">Processing your payment...</p>
      {polling && <p className="text-sm text-gray-400 mt-2">Please wait while we confirm your booking.</p>}
    </div>
  );
};

export default Loading;



