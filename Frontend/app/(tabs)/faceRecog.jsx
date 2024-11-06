import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { storage } from './../../configs/FirebaseConfig';

const FaceComparison = () => {
  const [image1, setImage1] = useState(null);
  const [firebaseImages, setFirebaseImages] = useState([]);
  const [isSamePerson, setIsSamePerson] = useState(null);
  const [matchedImageName, setMatchedImageName] = useState(null);

  useEffect(() => {
    // Load face-api models
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const fetchESP32Image = async () => {
    try {
      const response = await fetch("http://192.168.0.104/capture");
// Replace with your ESP32 IP address
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImage1(imageUrl);
    } catch (error) {
      console.error("Error fetching image from ESP32:", error);
    }
  };

  const fetchFirebaseImages = async () => {
    try {
      const imagesRef = ref(storage, 'images/'); // Assuming all images are stored under 'images' folder
      const result = await listAll(imagesRef);
      const imageUrls = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { url, name: itemRef.name }; // Store both URL and name
        })
      );
      setFirebaseImages(imageUrls);
    } catch (error) {
      console.error("Error fetching Firebase images:", error);
    }
  };

  useEffect(() => {
    fetchESP32Image(); // Fetch ESP32 image on mount
    fetchFirebaseImages(); // Fetch Firebase images on mount
  }, []);

  const compareFaces = async () => {
    setIsSamePerson(null);
    setMatchedImageName(null); // Reset matched image name

    if (!image1 || firebaseImages.length === 0) {
      setIsSamePerson("Capture an image from ESP32 and fetch images from Firebase to compare.");
      return;
    }

    try {
      const img1 = await faceapi.fetchImage(image1, { crossOrigin: "anonymous" });
      console.log("Image 1 loaded successfully");

      for (const firebaseImage of firebaseImages) {
        const img2 = await faceapi.fetchImage(firebaseImage.url, { crossOrigin: "anonymous" });
        console.log("Firebase Image loaded successfully");

        const fullFaceDescription1 = await faceapi
          .detectSingleFace(img1)
          .withFaceLandmarks()
          .withFaceDescriptor();
        const fullFaceDescription2 = await faceapi
          .detectSingleFace(img2)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!fullFaceDescription1 || !fullFaceDescription2) {
          continue; // Skip this comparison if faces are not detected
        }

        const distance = faceapi.euclideanDistance(
          fullFaceDescription1.descriptor,
          fullFaceDescription2.descriptor
        );

        const threshold = 0.6;
        if (distance < threshold) {
          setIsSamePerson(`The uploaded image matches an image from Firebase.`);
          
          // Extract the filename without extension
          const fileNameWithoutExtension = firebaseImage.name.split('.')[0];
          setMatchedImageName(fileNameWithoutExtension); // Set the matched image's name without extension

          return; // Stop further comparisons once a match is found
        }
      }

      setIsSamePerson("The uploaded image doesn't match any images from Firebase.");
    } catch (error) {
      console.error("Error during face comparison:", error);
      setIsSamePerson("An error occurred during face comparison.");
    }
  };

  return (
    <div>
      <h1>Face Comparison</h1>
      <button onClick={compareFaces} disabled={!image1 || firebaseImages.length === 0}>
        Compare Faces
      </button>
      <div>
        {isSamePerson !== null && <p>{isSamePerson}</p>}
        {matchedImageName && <p>Matched Firebase Image: {matchedImageName}</p>} {/* Display matched image name without extension */}
      </div>
      <div>
        {image1 && <img src={image1} alt="ESP32 Captured Image" style={{ width: "150px", height: "auto" }} />}
      </div>
      <div>
        {firebaseImages.length > 0 && (
          <div>
            <h3>Images from Firebase</h3>
            {firebaseImages.map((firebaseImage, index) => (
              <img
                key={index}
                src={firebaseImage.url}
                alt={`Firebase Image ${index}`}
                style={{ width: "150px", height: "auto", margin: "10px" }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceComparison;
