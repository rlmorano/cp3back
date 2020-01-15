const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../config/keys').jwtSecret;
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

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

    const user = await Booking.findOne({ _id: req.params.id }).populate('user', 'email', User);

    nodemailer.createTestAccount((err, account) => {
      let transporter = nodemailer.createTransport({
        host: 'smtp.googlemail.com', // Gmail Host
        port: 465, // Port
        secure: true, // this is true as port is 465
        auth: {
          user: 'altemailstudent@gmail.com', //Gmail username
          pass: 'Patr!ck01' // Gmail password
        }
      });

      let mailOptions = {
        from: '"Tattooz Support" <altemailstudent@gmail.com>',
        to: user.user.email, // Recepient email address. Multiple emails can send separated by commas
        subject: 'Booking Confirmation',
        text: 'Please be advised the booking request you made is Rejected.'
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      });
    });


    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

router.put('/:id/accept', auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate({ _id: req.params.id }, { status: 'Approved' });

    const user = await Booking.findOne({ _id: req.params.id }).populate('user', 'email', User);

    nodemailer.createTestAccount((err, account) => {
      let transporter = nodemailer.createTransport({
        host: 'smtp.googlemail.com', // Gmail Host
        port: 465, // Port
        secure: true, // this is true as port is 465
        auth: {
          user: 'altemailstudent@gmail.com', //Gmail username
          pass: 'Patr!ck01' // Gmail password
        }
      });

      let mailOptions = {
        from: '"Tattooz Support" <altemailstudent@gmail.com>',
        to: user.user.email, // Recepient email address. Multiple emails can send separated by commas
        subject: 'Booking Confirmation',
        text: 'Please be advised the booking request you made is Approved.'
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      });
    });

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});


module.exports = router;
