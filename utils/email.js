const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

// create email object by passing user and url to send email
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.username.split(' ')[0];
    this.url = url;
    this.from = `The Tour <${process.env.EMAIL_FROM}>`;
  }

  initalizeTransporter() {
    // use Sendgrid in prod env
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // use nodemailer in dev env
    // create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // instance method: send email (use in sending template)
  async send(template, subject) {
    // render in-email webpage via pug
    const webPageContent = pug.renderFile(
      `${__dirname}/../views/emailTemplate/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // define mailOptions for transporter
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: webPageContent,
      text: htmlToText(webPageContent),
    };

    // create transporter to send email
    await this.initalizeTransporter().sendMail(mailOptions);
  }

  // send wellcome email
  async sendWellcome() {
    await this.send('welcome', 'Welcome to The Tour!');
  }

  // send reset password email
  async sendResetPassword() {
    await this.send('resetPassword', 'The Tour - Reset password.');
  }
};

// simple send email function
/* const sendEmail = async options => {
  // create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // define the email options
  const mailOptions = {
    from: '',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail; */
