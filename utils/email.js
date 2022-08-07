const nodemailer = require('nodemailer');

const sendEmail = async options => {

    // 1 Create a Transporter
    const transporter = nodemailer.createTransport({
       
        host: 'smtp.mailtrap.io',
        port: 2525,
        // logger: true,
        secure:false ,
        auth: {
            user: "e80c85f26fded2",
            pass: "18c517e16a200b"
        },
        
        // Activate in GMail -- less secure app -- option
    })
// 2 Create an Email and define options 
    const mailOptions ={
        from: 'Jobanpreet Singh <jobandev70@gmail.com>',
        to : options.email,
        subject: options.subject,
        text: options.message
        
    }
// 3 Actually send a Email
    await  transporter.sendMail(mailOptions);
}
module.exports = sendEmail;

