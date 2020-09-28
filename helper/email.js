const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    host: "mail.3iinfo.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "developer@3iinfo.com", // generated ethereal user
      pass:  "311nf0C0m"
    },
    tls: {
        rejectUnauthorized: false
    }
});


async function sendDynamicMail(to, subject, htmlSend){
    console.log()
    var mailOptions = {
        from: 'developer@3iinfo.com',
        to : to,
        subject : subject,
        attachments: [{
            filename: 'icon.png',
            path: __dirname + '/icon.png',
            cid: 'logo' //same cid value as in the html img src
        }],
        html : htmlSend,
    };

    smtpTransport.sendMail(mailOptions,function (error, response) {
        console.log('response',response);
        console.log('error',error);
        if(response){
            return true;
        }
        if (error) {
           return error;
            //callback(error);
        }
    });
}

module.exports = {
    sendDynamicMail
}