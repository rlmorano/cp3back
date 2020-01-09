const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../config/keys').jwtSecret;
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// @route POST api/users/register
// @desc Register user
// @access Public
router.post(
  '/register',
  [
    check('firstname', 'First Name field is required')
      .not()
      .isEmpty(),
    check('lastname', 'Last Name field is required')
      .not()
      .isEmpty(),
    check('email')
      .not()
      .isEmpty()
      .withMessage('Email field is required')
      .isEmail()
      .withMessage('Email is invalid'),
    check('password', 'Password must be at least 6 characters').isLength({
      min: 6
    }),
    check('mobilenumber')
      .not()
      .isEmpty()
      .withMessage('Mobile Number field is required')
      .withMessage('Mobile Number is invalid'),
    check('password', 'Password must be at least 11 characters').isLength({
      min: 11
    }),
    check('confirmpassword')
      .not()
      .isEmpty()
      .withMessage('Confirm Password field is required')
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords must match');
        } else {
          return value;
        }
      })
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errorResponse = errors.array({ onlyFirstError: true });

      const extractedErrors = {};
      errorResponse.map(err => (extractedErrors[err.param] = err.msg));
      return res.status(400).json(extractedErrors);
    }

    const { firstname, lastname, email, mobilenumber, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ email: 'Email already exists' });
      }

      user = await User.findOne({ mobilenumber });

      if (user) {
        return res.status(400).json({ mobilenumber: 'Mobile Number already exists' });
      }

      user = new User({
        firstname,
        lastname,
        email,
        mobilenumber,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      const newUser = await user.save();
      res.json(newUser);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post(
  '/login',
  [
    check('email')
      .not()
      .isEmpty()
      .withMessage('Email field is required')
      .isEmail()
      .withMessage('Email is invalid'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('Password field is required')
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errorResponse = errors.array({ onlyFirstError: true });

      const extractedErrors = {};
      errorResponse.map(err => (extractedErrors[err.param] = err.msg));
      return res.status(400).json(extractedErrors);
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ emailnotfound: 'Email not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ passwordincorrect: 'Password incorrect' });
      }

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      jwt.sign(
        payload,
        jwtSecret,
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;
          res.json({ success: true, token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
