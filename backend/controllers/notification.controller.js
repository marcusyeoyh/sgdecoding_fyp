const axios = require("axios");
var nodemailer = require('nodemailer');

async function emailNotification(req, res, next) {

    const email =req.params.email;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sgdecoding@gmail.com',
          pass: 'fpnkumvhkwfvhubh'
        }
      });
      
      var mailOptions = {
        from: 'sgdecoding@gmail.com',
        to: email,
        subject: 'Transcription job has been completed!',
        html: '<p>Dear User, transcription job has been completed!</p>'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return res.status(403).send();
        } else {
          console.log('Email sent: ' + info.response);
          return res.status(200).send();
        }
      });
}

module.exports = {
	emailNotification
}