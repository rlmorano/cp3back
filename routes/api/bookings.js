const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../config/keys').jwtSecret;
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @route POST api/booking/new
// @desc Booking
// @access Private
router.post('/new', auth, async (req, res) => {
  try {
    const booking = new Booking({
      booking_date: req.body.booking_date,
      artist: req.body.artist,
      service: req.body.service,
      time: req.body.time,
      user: req.user.id
    });

    booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/booking/mybookings
// @desc User Bookings
// @access Private
router.get('/mybookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });

    res.send(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.get('/allbookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'firstname lastname mobilenumber', User);

    res.send(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndRemove({ _id: req.params.id });

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

// approve & reject
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate({ _id: req.params.id }, { status: 'Rejected' });

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

router.put('/:id/accept', auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate({ _id: req.params.id }, { status: 'Approved' });

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});


module.exports = router;
