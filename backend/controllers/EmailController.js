const sgMail = require('@sendgrid/mail');
const {v4: uuidv4} = require('uuid');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendStudentInvite=async (req, res) => {
    try{
        const {personalEmail, systemEmail, group}=req.body;
        if(!personalEmail || !systemEmail){
            return res.status(400).json({error: 'Both email addresses are required'});
        }

        //unique token for the invitation
        const token = uuidv4();

        const inviteUrl=`${process.env.FRONTEND_URL}/complete-registration?token=${token}&role=2&email=${encodeURIComponent(systemEmail)}&group=${encodeURIComponent(group)}`;

        //email content
        const msg={
            to: personalEmail,
            from: 'mentislearning000@gmail.com',
            subject: 'Complete your Registration for Mentis Learning',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #78A1E1;">Welcome to Mentis Learning</h2>
                <p>You have been invited to register as a student with the email: <strong>${systemEmail}</strong></p>
                <p>For group: ${group}</p>
                <p>Please click the button below to complete your registration:</p>
                <a href="${inviteUrl}" style="background-color: #78A1E1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Complete Registration</a>
                <p>Thank you,<br>The Mentis Team</p>
            </div>
        `        
    };

        await sgMail.send(msg);    
        return res.status(200).json({message: 'Invitation sent successfully'});
    }catch(error){
        console.error('Error sending invitation:', error);
        return res.status(500).json({error: 'Error sending invitation', details: error.message});
    }

};

exports.sendProfessorInvite=async(req, res) => {
    try{
        const {personalEmail, systemEmail, groups}=req.body;
        if(!personalEmail || !systemEmail){
            return res.status(400).json({error: 'Both email addresses are required'});
        }


        //unique token for the invitation
        const token = uuidv4();

        const groupsParam = encodeURIComponent(JSON.stringify(groups));
        const inviteUrl = `${process.env.FRONTEND_URL}/complete-registration?token=${token}&role=1&email=${encodeURIComponent(systemEmail)}&groups=${groupsParam}`;

        const msg={
            to: personalEmail,
            from: 'mentislearning000@gmail.com',
            subject: 'Complete your Registration for Mentis Learning',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #78A1E1;">Welcome to Mentis Learning</h2>
                    <p>You have been invited to register as a professor with the email: <strong>${systemEmail}</strong></p>
                    <p>Please click the button below to complete your registration:</p>
                    <a href="${inviteUrl}" style="background-color: #78A1E1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Complete Registration</a>
                    <p>Thank you,<br>The Mentis Team</p>
                </div>
            `
        };
        
        await sgMail.send(msg);
        return res.status(200).json({message: 'Invitation sent successfully'});

    }catch(error){
        console.error('Error sending invitation:', error);
        return res.status(500).json({error: 'Error sending invitation', details: error.message});
    }

};