const mongoose= require('mongoose');

const AdminSchema = new mongoose.Schema({
    adminId: { type: String, required: true, unique: true },
    adminEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Number, required: true }
});

module.exports = mongoose.model('Admin', AdminSchema);