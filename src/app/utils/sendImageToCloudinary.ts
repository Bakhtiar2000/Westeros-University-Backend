import { v2 as cloudinary } from 'cloudinary';

export const sendImageToCloudinary = () => {
  cloudinary.config({
    cloud_name: 'dawnjp24z',
    api_key: '397258563515255',
    api_secret: '<your_api_secret>',
  });
  cloudinary.uploader
    .upload(
      'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
      {
        public_id: 'shoes',
      },
    )
    .catch((error) => {
      console.log(error);
    });
};
