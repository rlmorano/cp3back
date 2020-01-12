const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/api/users');
const account = require('./routes/api/account');
const booking = require('./routes/api/bookings');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());

const db = require('./config/keys').mongoURI;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

app.use('/api/users', users);
app.use('/api/account', account);
app.use('/api/booking', booking);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
