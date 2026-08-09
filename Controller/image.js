/* const Image = require('../Model.js/imageFiles');
const { uploadFile } = require('../Cloudinaryhelper/helper');
const fs = require('fs');


const UploadImagetocloudinary = async (req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({ message: 'File is required.' });
        }

        const {URL, publicId} = await uploadFile(req.file.path);

        fs.unlinkSync(req.file.path);

       const newFile = new Image({
    url: URL,
    publicId,
    uploadedBy: req.user.userId
});
        await newFile.save();
        
        res.status(200).json({ message: 'File uploaded successfully.', image: newFile });
    }
    catch (error) {
        res.status(500).json({ message: 'Error uploading file.', error });
    }

}

module.exports = { UploadImagetocloudinary }; */