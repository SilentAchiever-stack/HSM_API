const Cloudinary = require('../Config/Cloudinary.js');

const uploadFile = async (filePath) => {
  try {
    const result = await Cloudinary.uploader.upload(filePath, {
      resource_type: 'auto'
    });
    return {
      URL: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

module.exports = { uploadFile };
