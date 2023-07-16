import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import superAdmin from "../models/SuperAdmin.js"

const storageAccountName = "AKIAVVZ3RHZCZWGQUV6N";
const storageAccountKey = "r4ws5n+GarcBeHJr7cA6LWW7MjlfTWfL/Tz7M28k";
const bucketName = "qms-app";

// Set up AWS configuration
AWS.config.update({
    accessKeyId: storageAccountName,
    secretAccessKey: storageAccountKey,
});

const s3 = new AWS.S3();

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload-image/:id", upload.single("file"), async (req, res) => {
    try {
        const imageName = `${req.file.originalname}-${Date.now()}`; // or whatever name you want to give

        const params = {
            Bucket: bucketName,
            Key: imageName,
            Body: req.file.buffer,
            ContentType: "image/jpeg", // Adjust the content type based on the actual image format
        };

        const response = await s3.upload(params).promise();
        const url = response.Location;
        const admin = await superAdmin.findByIdAndUpdate(req.params.id, { $push: { imagesList: url } }, { new: true })
        res.status(200).json({ admin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload file" });
    }
});


router.post("/upload-video/:id", upload.single("file"), async (req, res) => {
    try {
        const videoName = `${req.file.originalname}-${Date.now()}`; // or whatever name you want to give

        const params = {
            Bucket: bucketName,
            Key: videoName,
            Body: req.file.buffer,
            ContentType: "video/mp4", // Adjust the content type based on the actual image format
        };

        const response = await s3.upload(params).promise();
        const url = response.Location;
        const admin = await superAdmin.findByIdAndUpdate(req.params.id, { $set: { videoLink: url } }, { new: true })
        res.status(200).json({ admin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload file" });
    }
});

router.post("/upload-images/:id", upload.array("files"), async (req, res) => {
    try {
        const urls = [];
        for (const file of req.files) {
            const imageName = `${file.originalname}-${Date.now()}`; // or whatever name you want to give

            const params = {
                Bucket: bucketName,
                Key: imageName,
                Body: file.buffer,
                ContentType: "image/jpeg", // Adjust the content type based on the actual image format
                ACL: "public-read"
            };

            const response = await s3.upload(params).promise();
            const url = response.Location;
            await superAdmin.findByIdAndUpdate(req.params.id, { $push: { imagesList: url } }, { new: true })
            urls.push(url);
        }
        res.status(200).json({ urls });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload files" });
    }
});

export default router;
