const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
require('dotenv').config();

const app=express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL).then(()=>console.log(`Connected to MongoDB...`)).catch((err)=>console.log('Database connection error: ', err));

const PORT=process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`));

//routes
const studentRoutes=require('./routes/StudentRoutes');
const professorRoutes=require('./routes/ProfessorRoutes');
const adminRoutes=require('./routes/AdminRoutes');
const emailRoutes=require('./routes/EmailRoutes');
const courseRoutes=require('./routes/CourseRoutes');
const materialRoutes=require('./routes/MaterialRoutes');

app.use('/api/student', studentRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/material', materialRoutes);