module.exports = {
  port: process.env.port || 5000,
  mongoURI: 'mongodb+srv://admin:Admin123@cluster0-45b7c.mongodb.net/test?retryWrites=true&w=majority',
  jwtSecret: 'secret'
};
