const nodeMailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const transport = nodeMailer.createTransport(
  sendGridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

const sendMail = async (email, token, id) => {
  try {
    await transport.sendMail({
      to: email,
      from: "adeakanfea@gmail.com",
      subject: " You Just created An Account With Us",
      text: "Verify it's you ",
      html: `
        <div>
        <h4>Your account has been created. Verify by clicking This
        click this <a href="http://localhost:3000/activate/${token}|${id}">Link<a/>
        </h4>
        <p>Link expires in one hour</p>
        </div>
        `,
    });
  } catch (error) {
    throw error;
  }
};

const SendResetEmail = async (email, token, id) => {
  try {
    await transport.sendMail({
      to: email,
      from: "adeakanfea@gmail.com",
      subject: "Your Requested for a reset password Link",
      text: "Your Request to reset Password has been approved",
      html: `
        <div>
        <h4>Here is your reset Password Link
        here <a href="http://localhost:3000/reset/${token}|${id}">Link<a/>
        </h4>
        <p>Link expires in one hour</p>
        </div>
        `,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = { sendMail, SendResetEmail };
