import {useState, useEffect} from 'react';
import axios from 'axios';
import './MaterialsView.css';

const MaterialsView=({courseId, isProfessor})=>{
    const [materials, setMaterials]=useState([]);
    const [loading, setLoading]=useState(true);
    const [error, setError]=useState('');
    const [showUploadForm, setShowUploadForm]=useState(false);
    const [uploadForm, setUploadForm]=useState({
        title: '',
        description: '',
        file: null
    });
    const [uploadStatus, setUploadStatus]=useState({message: '', type: ''});

    const fetchMaterials=async()=>{
        try{
            setLoading(true);
            const response=await axios.get(`http://localhost:5000/api/material/course/${courseId}`);
            setMaterials(response.data);
            setError('');
        }catch(err){
            console.error("Error fetching materials:", err);
            setError('Failed to load materials.');
        }finally{
            setLoading(false);
        }
    };
    
    useEffect(()=>{
        fetchMaterials();
    }, [courseId]);

    const handleInputChange=(e)=>{
        const{name, value}=e.target;
        setUploadForm({...uploadForm, [name]: value});
    }

    const handleFileChange=(e)=>{
        setUploadForm({...uploadForm, file: e.target.files[0]});
    };
    
    const handleSubmit=async(e)=>{
        e.preventDefault();

        if (!uploadForm.title.trim()) {
          setUploadStatus({ message: "Title is required", type: "error" });
          return;
        }

        if (!uploadForm.description.trim()) {
          setUploadStatus({
            message: "Description is required",
            type: "error",
          });
          return;
        }

        //file validation
        if (!uploadForm.file) {
          setUploadStatus({
            message: "Please select a file to upload",
            type: "error",
          });
          return;
        }

        // Check file size (20 MB limit)
        if (uploadForm.file.size > 20 * 1024 * 1024) {
          setUploadStatus({
            message: "File size must be less than 20MB",
            type: "error",
          });
          return;
        }

        // Check file type
        const fileName = uploadForm.file.name.toLowerCase();
        const allowedTypes = [
          ".pdf",
          ".doc",
          ".docx",
          ".ppt",
          ".pptx",
          ".txt",
          ".zip",
          ".rar",
          ".jpg",
          ".jpeg",
          ".png",
        ];
        const hasValidExtension = allowedTypes.some((ext) =>
          fileName.endsWith(ext)
        );

        if (!hasValidExtension) {
          setUploadStatus({
            message:
              "File type not allowed. Please use document, image or archive files",
            type: "error",
          });
          return;
        }



        try{
            setLoading(true);
            const formData=new FormData();
            formData.append('materialTitle', uploadForm.title);
            formData.append('materialDescription', uploadForm.description);
            formData.append('courseId', courseId);
            formData.append('materialFile', uploadForm.file); 

            await axios.post('http://localhost:5000/api/material/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadStatus({message: 'Material uploaded successfully', type: 'success'});
            setUploadForm({title: '', description: '', file: null});

            fetchMaterials();

            setTimeout(() => {
                setShowUploadForm(false);
                setUploadStatus({message: '', type: ''});
            }, 2000);
        }catch(err){
            console.error("Error uploading material:", err);
            setUploadStatus({message: 'Failed to upload material', type: 'error'});
        }finally{
            setLoading(false);
        }
    };

    const handleDownload=async(materialId, fileName)=>{
        try{
            const response=await axios.get(`http://localhost:5000/api/material/download/${materialId}`, {
                responseType: 'blob'
            });
            
            const url=window.URL.createObjectURL(new Blob([response.data]));
            const link=document.createElement('a');
            link.href=url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }catch(err){
            console.error("Error downloading material:", err);
            alert('Failed to download material');
        }
    };

    if(loading&&materials.length===0){
        return <div className='loading-container'>Loading materials...</div>;
    }

    return(
        <div className='materials-view'>
            <div className='materials-header'>
                <h2>Course Materials</h2>
                {isProfessor && (
                    <button className='upload-btn' onClick={()=>setShowUploadForm(!showUploadForm)}>
                        {showUploadForm ? 'Cancel' : '+ Upload Material'}
                    </button>
                )}
            </div>
            
            {error && <div className="materials-error">{error}</div>}
            
            {showUploadForm && (
                <div className='material-upload-form'>
                    <h3>Upload New Material</h3>
                    <form onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label>Title</label>
                            <input 
                                type='text' 
                                name='title' 
                                value={uploadForm.title} 
                                onChange={handleInputChange} 
                                required/>
                        </div>
                        <div className='form-group'>
                            <label>Description</label>
                            <textarea 
                                name='description' 
                                value={uploadForm.description} 
                                onChange={handleInputChange} 
                                required></textarea>
                        </div>
                        <div className='form-group'>
                            <label>File</label>
                            <input 
                                type='file' 
                                name='file' 
                                accept='.pdf,.doc,.docx,.ppt,.pptx,.txt' 
                                onChange={handleFileChange} 
                                required/>
                        </div>

                        {uploadStatus.message && (
                            <div className={`upload-status ${uploadStatus.type}`}>
                                {uploadStatus.message}
                            </div>
                        )}

                        <div className='form-actions'>
                            <button type='submit' className='submit-btn'>Upload</button>
                        </div> 
                    </form>
                </div>
            )}

            <div className='materials-list'>
                {materials.length===0 ? (
                    <div className="no-materials">
                        <p>No materials available for this course yet.</p>
                    </div>
                ) : (
                    materials.map(material => (
                        <div key={material.materialId} className="material-card">
                            <div className="material-info">
                                <h3>{material.materialTitle}</h3>
                                <p className="material-description">{material.materialDescription}</p>
                                <p className="upload-date">
                                    Uploaded on {new Date(material.materialFiles[0]?.uploadDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="material-actions">
                                {material.materialFiles && material.materialFiles.map(file => (
                                    <button 
                                        key={file._id}
                                        className="download-btn"
                                        onClick={() => handleDownload(material.materialId, file.fileName)}
                                    >
                                        Download {file.fileName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default MaterialsView;