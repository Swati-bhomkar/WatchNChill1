import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'

import { assets } from '../assets/assets'
import { toast } from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {
  const groupRows = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J']]

  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState([])
  const [occupiedSeats, setOccupiedSeats] = useState([])

  const navigate = useNavigate()
  const { axios, getToken, user } = useAppContext()

  const priceByRow = (row) => {
    if (['A', 'B'].includes(row)) return 100
    if (['C', 'D', 'E', 'F'].includes(row)) return 150
    return 250
  }

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.success) setShow(data.shows)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast('Please select a time first')
    if (occupiedSeats.includes(seatId))
      return toast('This seat is already occupied')

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((seat) => seat !== seatId))
    } else {
      if (selectedSeats.length >= 5)
        return toast('You can select maximum 5 seats')
      setSelectedSeats((prev) => [...prev, seatId])
    }
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, i) => {
          const seatId = `${row}${i + 1}`
          const isSelected = selectedSeats.includes(seatId)
          const isOccupied = occupiedSeats.includes(seatId)

          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-primary/60
                ${isOccupied
                  ? 'bg-gray-600 text-white cursor-not-allowed'
                  : isSelected
                    ? 'bg-primary text-white'
                    : 'bg-transparent hover:bg-primary/20 cursor-pointer'
                }
              `}

            >
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )

  const getOccupiedSeats = async (showId) => {
    if (!showId) return
    try {
      const { data } = await axios.get(`/api/booking/seats/${showId}`)
      if (data.success) setOccupiedSeats(data.occupiedSeats || [])
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getShow()
  }, [date])

  useEffect(() => {
    if (selectedTime) {
      setSelectedSeats([])
      setOccupiedSeats([])
      getOccupiedSeats(selectedTime.showId)
    }
  }, [selectedTime])

  const currentShow = show?.find((s) => s._id === selectedTime?.showId)
  const seatPrice = selectedSeats.reduce((sum, seatId) => {
    return sum + priceByRow(seatId.charAt(0))
  }, 0)

  const totalPrice = seatPrice + (currentShow?.showPrice || 0)

  return show && show.length > 0 ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      <div className="flex flex-col md:sticky md:top-30">
        {/* Available Timings */}
        <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max">
          <p className="text-lg font-semibold px-6">Available Timings</p>
          <div className="mt-5 space-y-1">
            {show.map((showItem) => (
              <div
                key={showItem.showDateTime}
                onClick={() =>
                  setSelectedTime({
                    showId: showItem._id,
                    time: showItem.showDateTime,
                  })
                }
                className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === showItem.showDateTime
                  ? 'bg-primary text-white'
                  : 'hover:bg-primary/20'
                  }`}
              >
                <ClockIcon className="w-4 h-4" />
                <p className="text-sm">
                  {isoTimeFormat(showItem.showDateTime)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ IMPROVED Seat Category */}
        <div className="w-60 bg-primary/10 border border-primary/20 rounded-xl p-6 mt-4">
          <p className="text-lg font-semibold mb-4">Seat Categories</p>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <p className="font-medium">Normal</p>
              </div>
              <p className="text-gray-400">Rows A – B</p>
            </div>

            <div className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <p className="font-medium">Standard</p>
              </div>
              <p className="text-gray-400">Rows C – F</p>
            </div>

            <div className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <p className="font-medium">VIP</p>
              </div>
              <p className="text-gray-400">Rows G – J</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="relative flex flex-1 flex-col items-center max-md:mt-16">
        <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>{group.map((row) => renderSeats(row))}</div>
            ))}
          </div>
        </div>

        <div className="mt-8 w-full flex justify-center">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 w-80 md:w-96">
            <p className="text-sm text-gray-400 mt-4">Selected Time</p>
            <p className="font-semibold text-lg">
              {selectedTime ? isoTimeFormat(selectedTime.time) : '—'}
            </p>

            <div className="mt-4">
              <p className="text-sm text-gray-400">Seats</p>
              <p className="font-medium">
                {selectedSeats.length ? selectedSeats.join(', ') : '—'}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-400">Show Price</p>
              <p className="font-semibold text-lg">
                ₹{currentShow?.showPrice || 0}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-400">Seat Price</p>
              <p className="font-semibold text-lg">₹{seatPrice}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-400">Total</p>
              <p className="font-bold text-2xl">₹{totalPrice}</p>
            </div>

            <button
              onClick={async () => {
                if (!user) return navigate('/login')
                if (!selectedSeats.length)
                  return toast.error('Please select time and seats')

                const payload = {
                  userId: await getToken(),
                  showId: selectedTime.showId,
                  selectedSeats,
                }

                const { data } = await axios.post(
                  '/api/booking/create',
                  payload
                )

                if (data.success && data.url)
                  window.location.href = data.url
              }}
              className="flex items-center gap-1 mt-6 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium w-full justify-center"
            >
              Proceed to checkout
              <ArrowRightIcon stroke={3} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  )
}

export default SeatLayout
