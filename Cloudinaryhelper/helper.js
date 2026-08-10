/* const Cloudinary = require('../Config/Cloudinary.js');

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

module.exports = { uploadFile }; */

const Cloudinary = require('../Config/Cloudinary.js');

const uploadFile = (fileBuffer) => {
    return new Promise((resolve, reject) => {
   const stream = Cloudinary.uploader.upload_stream(
   { resource_type: 'auto' },
  (error, result) => {
  if (error) return reject(error);
   resolve({
  URL: result.secure_url,
  publicId: result.public_id
   });
   }
  );
  stream.end(fileBuffer);
    });
}

module.exports = { uploadFile };