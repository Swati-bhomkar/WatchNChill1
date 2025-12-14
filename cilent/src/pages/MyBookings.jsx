import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import timeFormat from '../lib/timeFormat';
import { dateFormat } from '../lib/dateFormat';
import isoTimeFormat from '../lib/isoTimeFormat';
import { useAppContext } from '../context/AppContext.jsx';
import { toast } from 'react-hot-toast';
import Loading from '../components/loading.jsx';

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const { axios, getToken, user, image_base_url } = useAppContext();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyBookings = async () => {
    try {
      const { data } = await axios.post('/api/user/booking', {
        userId: await getToken(),
      });
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleCancel = async (bookingId) => {
    try {
      const { data } = await axios.post(`/api/booking/cancel/${bookingId}`);
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
        toast.success('Booking cancelled');
      } else {
        toast.error(data.message || 'Unable to cancel booking');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    if (user) {
      getMyBookings();
    } else {
      setIsLoading(false);
      navigate('/login');
    }
  }, [user, navigate]);

  if (isLoading) {
    return <Loading />;
  }

  // Filter out any broken / null bookings to avoid crash
  const safeBookings = (bookings || []).filter(
    (item) => item && item.show && item.show.movie
  );

  return (
    <div className="realtive px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <h1 className="text-lg font-semibold mb-4">My Booking</h1>

      {safeBookings.length > 0 ? (
        safeBookings.map((item, index) => (
          <div
            key={item._id || index}
            className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
          >
            <div className="flex flex-col md:flex-row">
              <img
                src={image_base_url + item.show.movie.poster_path}
                alt={item.show.movie.title}
                className="md:max-w-40 aspect-video h-full object-cover object-bottom rounded"
              />
              <div className="flex flex-col p-4">
                <p className="text-lg font-semibold">
                  {item.show.movie.title}
                </p>
                <p className="text-gray-400 text-sm">
                  {timeFormat(item.show.movie.runtime)}
                </p>
                <p className="text-gray-400 text-sm mt-auto">
                  {dateFormat(item.show.showDateTime)} |{' '}
                  {isoTimeFormat(item.show.showDateTime)}
                </p>
                <p className="text-gray-400 text-sm">
                  Seats: {item.bookedSeats.join(', ')}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:items-end md:text-right justify-between p-4">
              <div className="flex items-center gap-4">
                <p className="text-2xl font-semibold mb-3">
                  {currency}
                  {item.amount}
                </p>

                {!item.isPaid && item.paymentLink && (
                  <a
                    href={item.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer"
                  >
                    Pay Now
                  </a>
                )}

                {!item.isPaid && (
                  <button
                    onClick={() => handleCancel(item._id)}
                    className="border border-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer hover:bg-primary/20"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No bookings found.</p>
      )}
    </div>
  );
};

export default MyBookings;


