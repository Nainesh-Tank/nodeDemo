const sqlhelper = require("./sqlhelper");
const nodemailer = require('nodemailer');
const { config } = require('../../config/index');

exports.LMG_SMTP_Mail = async (email_to,email_cc = "",subject,content,created_by) => {
    try {
      const header = `<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
      </head>
      
      <body>
      
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
          </style>
          <div id="mail">
              <div>
                  <table cellpadding="0" cellspacing="0" height="100%" width="100%">
                      <tr>
                          <td>
                              <p style="margin: 0;height:0;opacity:0;">industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum</p>
                          </td>
                      </tr>
                      <tr>
                          <td style="background-color: #F1F5F9;">
                              <table style="max-width: 580px; width: 100%; margin: 0 auto;" width="100%" cellspacing="0" cellpadding="0">
                                  <thead>
                                      <tr>
                                          <th style="padding: 60px 20px 0;">
                                              <a href="https://bharat_lgd.com/" target="_blank" draggable="false" style="width: 192px; height: 57px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                                                  <img src="https://i.ibb.co/yVRjm0q/logo.png" alt="letmegeab logo" draggable="false" width="192" height="57" style="width: 100%; height: 100%; object-fit: contain;" />
                                              </a>
                                          </th>
                                      </tr>
                                  </thead>
                                  <tbody>`;
      const footer = `<tr>
      <td style="padding: 0 20px 60px;">
          <table cellspacing="0" cellpadding="0" width="100%" style="min-width: 100%">
              <tbody>
                  <tr>
                      <td style="padding-top: 40px;">
                          <table cellspacing="0" cellpadding="0"
                              style="max-width: 215px; width: 100%; margin: 0 auto;">
                              <tbody>
                                  <tr>
                                      <td>
                                          <a href="https://www.facebook.com/" target="_blank" draggable="false" style="width: 30px; height: 30px; border-radius: 30px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 7px; box-shadow: 0px 13px 19px 0px rgba(49, 111, 246, 0.30);">
                                              <img src="https://i.ibb.co/sKQN9n1/facebook.png" style="width: 100%; height: 100%; object-fit: cover;" alt="bharat_lgd facebook" draggable="false" width="30" height="30">
                                          </a>
                                      </td>
                                      <td>
                                          <a href="https://www.instagram.com/" target="_blank" draggable="false" style="width: 30px; height: 30px; border-radius: 30px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 7px; box-shadow: 0px 13px 19px 0px rgba(255, 48, 108, 0.30);">
                                              <img src="https://i.ibb.co/r2LYrp3/instagram.png" style="width: 100%; height: 100%; object-fit: cover;" alt="bharat_lgd instagram" draggable="false" width="30" height="30">
                                          </a>
                                      </td>
                                      <td>
                                          <a href="mailto:business@bharat_lgd.com"
                                              target="_blank" draggable="false"
                                              style="width: 30px; height: 30px; border-radius: 30px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 7px; box-shadow: 0px 13px 19px 0px rgba(197, 34, 31, 0.30);">
                                              <img src="https://i.ibb.co/6Yt17xg/gmail.png" style="width: 100%; height: 100%; object-fit: cover;" alt="bharat_lgd gmail" draggable="false" width="30" height="30">
                                          </a>
                                      </td>
                                      <td>
                                          <a href="https://www.linkedin.com/"
                                              target="_blank" draggable="false"
                                              style="width: 30px; height: 30px; border-radius: 30px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 7px; box-shadow: 0px 13px 19px 0px rgba(0, 119, 181, 0.30);">
                                              <img src="https://i.ibb.co/nCwc73c/linkedin.png" style="width: 100%; height: 100%; object-fit: cover;" alt="bharat_lgd linkedin" draggable="false" width="30" height="30">
                                          </a>
                                      </td>
                                      <td>
                                          <a href="https://www.twitter.com/"
                                              target="_blank" draggable="false"
                                              style="width: 30px; height: 30px; border-radius: 30px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 7px; box-shadow: 0px 13px 19px 0px rgba(29, 161, 224, 0.30);">
                                              <img src="https://i.ibb.co/0fs9TvW/twitter.png" style="width: 100%; height: 100%; object-fit: cover;" alt="bharat_lgd twitter" draggable="false" width="30" height="30">
                                          </a>
                                      </td>
                                      <td>
                                          <a href="https://www.youtube.com/"
                                              target="_blank" draggable="false"
                                              style="width: 30px; height: 30px; border-radius: 30px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0px 13px 19px 0px rgba(197, 34, 31, 0.30);">
                                              <img src="https://i.ibb.co/ZmnGvZ9/youtube.png" style="width: 100%; height: 100%; object-fit: cover;" alt="bharat_lgd youtube" draggable="false" width="30" height="30">
                                          </a>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td style="padding-top: 30px;">
                          <p style="max-width: 383px; width: 100%; margin: 0 auto; color: #64748B; text-align: center; font-size: 14px; font-weight: 400; line-height: 1.42; font-family: 'Roboto', sans-serif;">
                              42, Meetraj, Opp Nakshatra Apartment, Near L.P Savani CNG Pump,Pal Canal road,Surat,Gujarat, IN - 395009
                          </p>
                      </td>
                  </tr>
                  <tr>
                      <td style="padding-top: 8px;">
                          <p style="color: #64748B; font-size: 14px; font-weight: 400; display: flex; align-items: center; justify-content: center; font-family: 'Roboto', sans-serif; margin: 0;">
                              <a href="tel:0261 672-2-672" target="_blank" style="color: #64748B; text-decoration: none; font-family: 'Roboto', sans-serif;">
                                  0261 672-2-672
                              </a>
                              <span style="margin: 0 3px;">|</span>
                              <a href="https://bharat_lgd.com/" target="_blank" style="color: #64748B; text-decoration: none; font-family: 'Roboto', sans-serif;">www.bharat_lgd.com</a>
                          </p>
                      </td>
                  </tr>
                  <tr>
                      <td style="padding-top: 30px;">
                          <table cellspacing="0" cellpadding="0" style="max-width: 264px; width: 100%; margin: 0 auto;">
                              <tbody>
                                  <tr>
                                      <td style=" padding-right: 8px;">
                                          <a href="https://play.google.com/store"
                                              target="_blank"
                                              style="flex: 1; display: flex; align-items: center; justify-content: center;" draggable="false">
                                              <img src="https://i.ibb.co/JFNXspt/play-store.png" alt="bharat_lgd play store" style="width: 100%; height: auto; object-fit: contain;" draggable="false" width="124" height="37">
                                          </a>
                                      </td>
                                      <td style=" padding-left: 8px;">
                                          <a href="https://www.apple.com/in/app-store/" target="_blank" style="flex: 1; display: flex; align-items: center; justify-content: center;" draggable="false">
                                              <img src="https://i.ibb.co/wykt1QT/app-store.png" alt="bharat_lgd app store" style="width: 100%; height: auto; object-fit: contain;" draggable="false" width="124" height="37">
                                          </a>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
      </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </table>
  </div>
  </div>
  </body>
  
  </html>`;
  
      const body = header+content+footer;
  
      const transporter = nodemailer.createTransport({
        host: config.mail_host,
        port: config.mail_port, // Your SMTP port (e.g., 587 for TLS or 465 for SSL)
        secure: true, // true for 465, false for other ports
        auth: {
          user: config.mail_username,
          pass: config.mail_password,
        },
        tls: {
          rejectUnauthorized: false,
        },
        // debug: true, // show debug output
        // logger: true
      });
  
      var mailOptions = {
        from: config.mail_username,
        to: email_to,
        cc: email_cc,
        subject: subject,
        html: body,
      };
      transporter.sendMail(mailOptions, function (err, res) {
        if (err) {
          return 0;
        } else {
          const payload = {
            email_from: config.mail_username,
            email_to: email_to,
            email_cc: email_cc || "",
            subject: subject,
            content: body,
            created_by: created_by,
          };
          // Insert the payload into the "mail" table
          sqlhelper.insert("mail", payload, (err, res) => {
            if (err) {
              return 0;
            } else {
              return res;
            }
          });
  
          return res;
        }
      });
    } catch (e) {
      console.log("Something has gone wrong!", e);
      return false;
    }
  };