const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    materialId: { type: String, required: true, unique: true },
    materialTitle: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    materialDescription: { type: String, required: true },
    materialFiles: [{
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Materials', MaterialSchema);