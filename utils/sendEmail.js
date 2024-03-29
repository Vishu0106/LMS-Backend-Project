import nodemailer from "nodemailer"


export const sendEmail = async function(email, subject, message) {
    let transport = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        secure:false, // true for 465, false for ohter ports
        auth: {
            user : process.env.SMTP_USERNAME,
            pass:process.env.SMTP_PASSWORD
        }
    });

    await transport.sendMail({
        from:process.env.SMTP_FROM_EMAIL,
        to:email,
        subject:subject,
        html:message
    });
}