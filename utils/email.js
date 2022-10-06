const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const sgmail = require('@sendgrid/mail');
// new Email(user, url).sendWelcom()
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = `Jobanpreet Singh <${process.env.EMAIL_FROM}>`

    }
    newTransport(){
        
        if(process.env.NODE_ENV === 'production'){
            // use sendgrid
            sgmail.setApiKey(process.env.SENDGRID_KEY_JOBAN);
            return nodemailer.createTransport({
              service: 'SendGrid',
              auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_KEY_JOBAN
              }
            });
        }
        return nodemailer.createTransport({
       
            host: 'smtp.mailtrap.io',
            port: 2525,
            secure:false ,
            auth: {
                user: "e80c85f26fded2",
                pass: "18c517e16a200b"
            },
            
            // Activate in GMail -- less secure app -- option
        })
    }
    // send the actual email
    
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}


