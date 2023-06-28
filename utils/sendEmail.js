const nodeMailer = require("nodemailer");

const sendEmail = async(options)=>{

        const transporter = nodeMailer.createTransport({
            host:process.env.SMTP_HOST,
            port:process.env.SMTP_PORT,
            secure:true,
            service:process.env.SMTP_SERVICE,
            auth:{
                user:process.env.SMTP_MAIL,          //SMTP - simple mail transfer protocol
                pass:process.env.SMTP_PASSWORD 
            }
        });
    
        const mailOptions ={
            from:process.env.SMTP_MAIL,
            to:options.email,
            subject:options.subject,
            text:options.message
        }
    
        // sending email 
        await transporter.sendMail(mailOptions,(error,res)=>{
            if(error){
                console.log(error);
            }else{
                console.log("email sent");
            }
        });
}

module.exports = sendEmail;