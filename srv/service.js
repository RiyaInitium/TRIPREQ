const axios = require('axios');

const { getDestination } = require('@sap-cloud-sdk/core');

const cds = require('@sap/cds');
const documentExtractClient = require('./util/documentextract');
var nodemailer = require('nodemailer');

function lPad(str, size) {
  var s = str.toString();
  while (s.length < size) {
    s = '0' + s;
  }
  return s; // return new number
}

class TravelApp extends cds.ApplicationService {
  init() {
    const { TravelRequest } = this.entities;
    this.before('CREATE', TravelRequest, async (context) => {
      const db = await cds.connect.to('db');

      var x = await db.run('SELECT "REQ_ID".NEXTVAL FROM DUMMY');
      var numberfinal = x[0]['REQ_ID.NEXTVAL'];
      context.data.REQID = numberfinal;

      if (context.data.departcity === context.data.destcity) {
        throw new cds.error('Departure and destination cannot be same', 400);
      }
      const currentYear = new Date().getFullYear();
      var dummy_num = 'TravelRequest-' + currentYear + '-' + lPad(numberfinal, 5);
      context.data.ReqNo = dummy_num;

      // if (context.data.purposeoftravel === "") {
      //   throw new cds.error("Please fill mandatory field", 400);
      // }
    });

    this.on('DocExtract', async function (req, res) {
      const { content, filename } = req.data,
        formData = new FormData(),
        ArrayBufferToBlob = (arrayBuffer) => {
          const extension = filename.split('.').pop().toLowerCase();
          let mimeType = '';

          switch (extension) {
            case 'pdf':
              mimeType = 'application/pdf';
              break;
            case 'jpg':
            case 'jpeg':
              mimeType = 'image/jpeg';
              break;
            case 'png':
              mimeType = 'image/png';
              break;
            case 'txt':
              mimeType = 'text/plain';
              break;
            case 'html':
              mimeType = 'text/html';
              break;
            case 'json':
              mimeType = 'application/json';
              break;
            default:
              mimeType = 'application/octet-stream';
          }
          const byteArray = new Uint8Array(arrayBuffer);
          const blob = new Blob([byteArray], { type: mimeType });
          return blob;
        };

      formData.append(
        'options',
        JSON.stringify({
          schemaId: 'cf8cc8a9-1eee-42d9-9a3e-507a61baac23',
          clientId: 'default',
          documentType: 'invoice',
          receivedDate: new Date().toISOString().split('T')[0],
          enrichment: {
            sender: {
              top: 5,
              type: 'businessEntity',
              subtype: 'supplier',
            },
            employee: {
              type: 'employee',
            },
          },
        })
      );

      formData.append('file', ArrayBufferToBlob(content), filename);
      try {
        const { data } = await documentExtractClient.post('/jobs', formData);
        return data;
      } catch (error) {
        return error?.message || 'An error occurred';
      }
    });

    this.on('GetExtract', async function (req, res) {
      try {
        const { id } = req.data;

        const { data } = await documentExtractClient.get('/jobs/' + id);
        return data;
      } catch (error) {
        return error?.message || 'An error occurred';
      }
    });

    this.after('CREATE', TravelRequest, async (context) => {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'tushar.ladhe116@gmail.com',
          pass: 'hlfs hrsj adgy hgxy',
        },
      });

      var mailOptions = {
        from: 'tushar.ladhe116@gmail.com',
        to: context.mgremail,
        subject: 'Travel Request',
        text: 'You have created an travel request and it has been sent to your manager for the Approval.',
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });

    return super.init();
  }
}

module.exports = { TravelApp };
