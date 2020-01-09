const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../config/keys').jwtSecret;
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @route POST api/account/update
// @desc Update user profile
// @access Private
router.put(
  '/update',
  [
    check('email', 'Email field is required')
      .trim()
      .not()
      .isEmpty()
  ],
  auth,
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errorResponse = errors.array({ onlyFirstError: true });

      const extractedErrors = {};
      errorResponse.map(err => (extractedErrors[err.param] = err.msg));
      return res.status(400).json(extractedErrors);
    }

    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { email: req.body.email } },
        { new: true }
      );

      const payload = {
        id: user.id,
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

// @route POST api/account/changepassword
// @desc Update user profile
// @access Private
router.put(
  '/changepassword',
  [
    check('newPassword', 'New Password must be at least 6 characters').isLength(
      {
        min: 6
      }
    ),
    check('newPassword2')
      .not()
      .isEmpty()
      .withMessage('Confirm New Password field is required')
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords must match');
        } else {
          return value;
        }
      })
  ],
  auth,
  async (req, res) => {
    let errors = validationResult(req);
    const extractedErrors = {};

    if (!errors.isEmpty()) {
      var errorResponse = errors.array({ onlyFirstError: true });
      errorResponse.map(err => (extractedErrors[err.param] = err.msg));
      // return res.status(400).json(extractedErrors);
    }

    try {
      let user = await User.findById(req.user.id);

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);

      if (!isMatch) {
        extractedErrors.oldPassword = 'Old Password incorrect';
      }

      if (req.body.oldPassword === req.body.newPassword) {
        extractedErrors.newPassword = 'New Password must be different';
      }

      if (Object.keys(extractedErrors).length !== 0) {
        return res.status(400).json(extractedErrors);
      }

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(req.body.newPassword, salt);

      await user.save();

      res.json({ success: true });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
