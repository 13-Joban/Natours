/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

const port= process.env.PORT || 3000;
const DB=process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
 
mongoose.connect(DB, {  useUnifiedTopology: true})
    .then(( ) => {
        // console.log(connect.connections);
        console.log('DB Connected successfully');
    })
    .catch(err => console.log(err));




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
