/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');
const fs = require('fs')

dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const Tour = require("../../models/tourModel");

const DB=process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
 
mongoose.connect(DB, {  useUnifiedTopology: true})
    .then(( ) => {
        // console.log(connect.connections);

        console.log('DB Connected successfully');
    })
    .catch(err => console.log(err));

    // READ  JSON FILE
    const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
    
     // IMPORT  INTO DATABASE

     const importintoDB = async () => {
       try {
        await  Tour.create(tours)
        console.log('Data successfully loaded')
        
        }
        catch(error){
            console.log(error);
        }
    
        process.exit();
     }

    //  DELETE FROM COLLECTION
    const deleteDatafromDB = async () => {
        try{
            await Tour.deleteMany();
            console.log('Data successfully deleted');
           
        }
        catch(error) {
            console.log(error);
        }
        process.exit();
    }

    if(process.argv[2] === '--import'){
        importintoDB()
    }
    if(process.argv[2] === '--delete'){
        deleteDatafromDB()
    }

console.log(process.argv)