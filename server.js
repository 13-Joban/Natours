/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

const port= process.env.PORT || 3000;
const DB=process.env.DATABASE;

mongoose.connect(DB, {useNewUrlParser: true});
mongoose.connection.once("open" , ()  => console.log('DB connected'));


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
