/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });
const mongoose = require('mongoose');
const app = require('./app');

const port= process.env.PORT || 3000;
// const DB=process.env.DATABASE;

mongoose
  .connect("mongodb+srv://joban:dlfnflN9485495LLNDFWwkldnd@cluster0.9ouvt.mongodb.net/natours?retryWrites=true&w=majority", {
    useNewUrlParser: true
  })
  .then(() => console.log('DB connection successful!'));


app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});



// process.on('unhandledRejection', err => {
//   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
