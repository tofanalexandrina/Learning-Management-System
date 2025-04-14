const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

exports.loginAdmin = async (req, res) => {
    const { adminEmail, password } = req.body;
        try{
            const admin = await Admin.findOne({ adminEmail });
            if(admin){
                const validPassword = await bcrypt.compare(password, admin.password);
                if(validPassword){
                    res.status(200).json({ message: 'Login successful', role: admin.role });
                }else{
                    res.status(400).json({ error: 'Invalid password' });
                }
            }
        }catch(err){
            res.status(500).json({ error: 'Error logging in', details: err.message });
        }
}