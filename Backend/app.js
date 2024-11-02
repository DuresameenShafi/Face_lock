const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const faceapi = require("face-api.js");
const { Canvas, Image, ImageData } = require("canvas");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Firebase Admin SDK initialization
const serviceAccount = require("./SecretAccount.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "authenticatio0n.appspot.com"
});
const bucket = admin.storage().bucket();

// Patch canvas into face-api.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load face-api.js models
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, "models"));
    await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, "models"));
    await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, "models"));
}

loadModels().then(() => console.log("Face-api.js models loaded"));

async function compareImages(base64Image) {
    const inputImage = await faceapi.bufferToImage(Buffer.from(base64Image.split(",")[1], "base64"));
    const inputDescriptors = await faceapi.detectAllFaces(inputImage).withFaceLandmarks().withFaceDescriptors();

    if (inputDescriptors.length === 0) {
        console.log("No faces detected in input image");
        return false;
    }

    // Get files from Firebase Storage folder (e.g., "person-images/")
    const [files] = await bucket.getFiles({ prefix: "person-images/" });
    for (const file of files) {
        const [buffer] = await file.download();
        const referenceImage = await faceapi.bufferToImage(buffer);
        const referenceDescriptors = await faceapi.detectAllFaces(referenceImage).withFaceLandmarks().withFaceDescriptors();

        for (let i = 0; i < inputDescriptors.length; i++) {
            const bestMatch = faceapi.findBestMatch(inputDescriptors[i].descriptor, referenceDescriptors.map(d => d.descriptor));
            if (bestMatch.distance < 0.6) { // Adjust threshold as needed
                console.log(`Match found: ${bestMatch}`);
                return true;
            }
        }
    }
    return false;
}

app.post("/receive-image", async (req, res) => {
    try {
        const base64Image = req.body.image;
        const isPersonFound = await compareImages(base64Image);
        if (isPersonFound) {
            res.json({ message: "Person Found" });
        } else {
            res.json({ message: "Random Person" });
        }
    } catch (error) {
        console.error("Error comparing images:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/latest-image", (req, res) => {
    if (latestImage) {
        res.json({ image: latestImage });
    } else {
        res.status(404).json({ error: "No image found" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
