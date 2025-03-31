const mongoose = require('mongoose');

const ProfessorSchema = new mongoose.Schema({
    professorId: { type: String, required: true, unique: true },
    professorFirstName: { type: String, required: true },
    professorLastName: { type: String, required: true },
    professorEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Number, required: true}
});

module.exports = mongoose.model('Professors', ProfessorSchema);