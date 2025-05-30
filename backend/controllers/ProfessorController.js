const Professor = require('../models/Professor');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

exports.registerProfessor = async (req, res) => {
    try{
        const { professorFirstName, professorLastName, professorEmail, password, groups, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const professorId = uuidv4();
        const newProfessor = new Professor({
            professorId,
            professorFirstName,
            professorLastName,
            professorEmail,
            password: hashedPassword,
            groups,
            role
        });
        await newProfessor.save();
        res.status(200).json({ message: 'Professor registered successfully' });
    } catch(err){
        res.status(500).json({ error: 'Error registering professor', details: err.message });
    }
};

exports.loginProfessor = async (req, res) => {
    const { professorEmail, password } = req.body;
    try{
        const professor = await Professor.findOne({ professorEmail });
        if(professor){
            const validPassword = await bcrypt.compare(password, professor.password);
            if(validPassword){
                res.status(200).json({ 
                    message: 'Login successful', 
                    professorFirstName: professor.professorFirstName, 
                    professorLastName: professor.professorLastName, 
                    id: professor.professorId, 
                    role: professor.role,
                    professorEmail: professor.professorEmail,
                    groups: professor.groups});
            }else{
                res.status(400).json({ error: 'Invalid password' });
            }
        }else{
            res.status(404).json({ error: 'Professor not found' });
        }
    }catch(err){
        res.status(500).json({ error: 'Error logging in', details: err.message });
    }
};

exports.completeRegistration = async (req, res) => {
    try{
        const { professorFirstName, professorLastName, professorEmail, password, groups,  token } = req.body;
        const professor = await Professor.findOne({ professorEmail });

        if(!professor){
            return res.status(404).json({ error: 'Professor not found' });
        }
        professor.professorFirstName = professorFirstName;
        professor.professorLastName = professorLastName;
        const salt = await bcrypt.genSalt(10);
        professor.password = await bcrypt.hash(password, salt);
        if (groups && groups.length > 0) {
            professor.groups = groups;
        }
        await professor.save();
        res.status(200).json({ message: 'Registration completed successfully' });
    }catch(err){
        res.status(500).json({ error: 'Error completing registration', details: err.message });
    }
};

exports.getAllProfessors = async (req, res) => {
    try {
        const professors = await Professor.find({}, { 
            password: 0
        });
        res.status(200).json(professors);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching professors', details: error.message });
    }
};