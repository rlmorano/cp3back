const mongoose = require('mongoose');

const BookingSchema = mongoose.Schema({
  booking_date: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Pending'
  }
});

module.exports = mongoose.model('booking', BookingSchema);
