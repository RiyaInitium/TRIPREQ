const cds = require('@sap/cds');
const { Console } = require('console');
var nodemailer = require('nodemailer');

class FinanceApp extends cds.ApplicationService {
  init() {
    const { TravelRequest } = this.entities;
    this.on('updateRequest', async (req) => {
      const { REQID, reqstatus, financenotes, empid, firstname, emailid } = req.data;

      try {
        if (req.data.reqstatus === 'ApprovedF') {
          const updatedRequest = await UPDATE(TravelRequest)
            .set({ reqstatus: reqstatus, financenotes: financenotes, statusflag: '2' })
            .where({ REQID: REQID });

          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'tushar.ladhe116@gmail.com',
              pass: 'hlfs hrsj adgy hgxy',
            },
          });

          var mailOptions = {
            from: 'tushar.ladhe116@gmail.com',
            to: req.data.emaildid,
            subject: 'Travel Request',
            text: 'You travel request is approved by finance team.',
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        } else if (req.data.reqstatus === 'RejectedF') {
          const updatedRequest = await UPDATE(TravelRequest)
            .set({ reqstatus: reqstatus, financenotes: financenotes, statusflag: '0' })
            .where({ REQID: REQID });

          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'tushar.ladhe116@gmail.com',
              pass: 'hlfs hrsj adgy hgxy',
            },
          });

          var mailOptions = {
            from: 'tushar.ladhe116@gmail.com',
            to: req.data.emailid,
            subject: 'Travel Request',
            text: "We cannot approve this expense as it exceeds the limits set by our company's expense policy. Please go to travel request portal and do the necessary changes.",
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    });

    return super.init();
  }
}

module.exports = { FinanceApp };
