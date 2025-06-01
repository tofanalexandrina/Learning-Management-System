const Material=require('../models/Material');
const Course=require('../models/Course');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR=path.join(__dirname, '../uploads/materials');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

exports.uploadMaterial=async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({message: 'No file uploaded'});
        }

        const{materialTitle, materialDescription, courseId}=req.body;

        if(!materialTitle || !materialDescription || !courseId){
            return res.status(400).json({message: 'All fields are required'});
        }

        const course=await Course.findOne({courseId});
        if(!course){
            return res.status(404).json({message: 'Course not found'});
        }

        const materialId=uuidv4();
        const file=req.file;
        const fileName=file.originalname;
        const filePath=`${materialId}-${fileName}`;

        const fileDestination=path.join(UPLOAD_DIR, filePath);
        fs.writeFileSync(fileDestination, file.buffer);

        const newMaterial=new Material({
            materialId,
            materialTitle,
            courseId: course._id,
            materialDescription,
            materialFiles:[{
                fileName, 
                filePath,
                uploadDate: new Date()
            }]
        });

        await newMaterial.save();

        res.status(201).json({
            success: true,
            message: 'Material uploaded successfully',
            material: newMaterial
        });
    }catch(err){
        console.error("Error uploading material:", err);
        res.status(500).json({message: 'Internal server error'});
    }
};

exports.getMaterialsByCourse=async (req, res) => {
    try{
        const { courseId } = req.params;

        const course = await Course.findOne({courseId});
        if(!course){
            return res.status(404).json({message: 'Course not found'});
        }

        const materials=await Material.find({courseId:course._id});
        res.status(200).json(materials);
    }catch(err){
        console.error("Error fetching materials:", err);
        res.status(500).json({message: 'Internal server error'});
    }
}

exports.downloadMaterial=async (req, res) => {
    try{
        const { materialId } = req.params;

        const material = await Material.findOne({materialId});
        if(!material || material.materialFiles.length === 0){
            return res.status(404).json({message: 'Material not found'});
        }

        const file=material.materialFiles[0];
        const filePath=path.join(UPLOAD_DIR, file.filePath);

        if(!fs.existsSync(filePath)){
            return res.status(404).json({message: 'File not found'});
        }
        res.download(filePath, file.fileName);
    }catch(err){
        console.error("Error downloading material:", err);
        res.status(500).json({message: 'Error downloading material'});
    }
}