// so we get control over caching and can invalidate it when we need to.
process.env.ETHEREAL_CACHE = "false";

import * as nodemailer from "nodemailer";
import * as imaps from "imap-simple";
import { simpleParser } from "mailparser";
export const makeEmailAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();

  const emailConfig = {
    imap: {
      user: testAccount.user,
      password: testAccount.pass,
      host: "imap.ethereal.email",
      port: 993,
      tls: true,
      authTimeout: 10000,
    },
  };
  const userEmail = {
    email: testAccount.user,

    /**
     * Utility method for getting the last email
     * for the Ethereal email account created above.
     */
    async getLastEmail() {
      // makes debugging very simple
      console.log("getting the last email");
      console.log(emailConfig);

      try {
        const connection = await imaps.connect(emailConfig);

        // grab up to 50 emails from the inbox
        await connection.openBox("INBOX");
        const searchCriteria = ["1:50"];
        const fetchOptions = {
          bodies: [""],
        };
        const messages = await connection.search(searchCriteria, fetchOptions);
        // and close the connection to avoid it hanging
        connection.end();

        if (!messages.length) {
          console.log("cannot find any emails");
          return null;
        } else {
          console.log("there are %d messages", messages.length);
          // grab the last email
          const mail = await simpleParser(
            messages[messages.length - 1].parts[0].body
          );
          console.log(mail.subject);
          console.log(mail.text);

          // and returns the main fields
          return {
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
          };
        }
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  };

  return userEmail;
};
