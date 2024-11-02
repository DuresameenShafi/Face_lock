const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.json());

let latestImage = "";

app.post("/receive-image", (req, res) => {
    latestImage = req.body.image; 
    console.log("Image received from ESP32-CAM");
    res.status(200).send("Image received");
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