const sgMail = require('@sendgrid/mail');
const {v4: uuidv4} = require('uuid');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendStudentInvite=async (req, res) => {}