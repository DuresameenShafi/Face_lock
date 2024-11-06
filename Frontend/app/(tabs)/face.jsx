// FaceComparison.js
import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const FaceComparison = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [isSamePerson, setIsSamePerson] = useState(null);

  useEffect(() => {
    // Load face-api models
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const compareFaces = async () => {
    setIsSamePerson(null);
    if (image1 && image2) {
      const img1 = await faceapi.fetchImage(image1);
      const img2 = await faceapi.fetchImage(image2);

      const fullFaceDescription1 = await faceapi
        .detectSingleFace(img1)
        .withFaceLandmarks()
        .withFaceDescriptor();
      const fullFaceDescription2 = await faceapi
        .detectSingleFace(img2)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!fullFaceDescription1 || !fullFaceDescription2) {
        setIsSamePerson("Could not detect both faces. Make sure the images contain clear faces.");
        return;
      }

      const distance = faceapi.euclideanDistance(
        fullFaceDescription1.descriptor,
        fullFaceDescription2.descriptor
      );

      // Define a threshold distance: the smaller the distance, the more similar the faces
      const threshold = 0.6;
      setIsSamePerson(distance < threshold);
    }
  };

  return (
    <div>
      <h1>Face Comparison</h1>
      <div>
        <label>
          Upload First Image:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, setImage1)}
          />
        </label>
      </div>
      <div>
        <label>
          Upload Second Image:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, setImage2)}
          />
        </label>
      </div>
      <button onClick={compareFaces} disabled={!image1 || !image2}>
        Compare Faces
      </button>
      <div>
        {isSamePerson !== null &&
          (isSamePerson === true ? (
            <p>The images contain the same person.</p>
          ) : isSamePerson === false ? (
            <p>The images contain different people.</p>
          ) : (
            <p>{isSamePerson}</p>
          ))}
      </div>
      <div>
        {image1 && <img src={image1} alt="Image 1" style={{ width: "150px", height: "auto" }} />}
        {image2 && <img src={image2} alt="Image 2" style={{ width: "150px", height: "auto" }} />}
      </div>
    </div>
  );
};

export default FaceComparison;      