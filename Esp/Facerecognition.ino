#include <WiFi.h>
#include <WiFiClient.h>
#include <HTTPClient.h>
#include <esp_camera.h>
#include "camera_pins.h"
#include "Base64.h"  
#include <ArduinoJson.h> 

#define CAMERA_MODEL_AI_THINKER

const char* ssid = "Redmi_9C";
const char* password = "aliza123";
const char* serverUrl = "https://face-lock-e1gf.vercel.app/receive-image";  
const char* resultUrl = "https://face-lock-e1gf.vercel.app/api/send-esp";   

const int greenLED = 13; // Green LED pin
const int redLED = 15;   // Red LED pin
const int solenoidPin = 12; // Solenoid pin

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  if (!initCamera()) {
    Serial.println("Camera initialization failed");
    while (true);  // Halt if camera init fails
  }

  pinMode(greenLED, OUTPUT);
  pinMode(redLED, OUTPUT);
  pinMode(solenoidPin, OUTPUT);

  // Ensure all are off initially
  digitalWrite(greenLED, LOW);
  digitalWrite(redLED, LOW);
  digitalWrite(solenoidPin, LOW);
}

bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = 5;
  config.pin_d1 = 18;
  config.pin_d2 = 19; 
  config.pin_d3 = 21;
  config.pin_d4 = 36;
  config.pin_d5 = 39;
  config.pin_d6 = 34;
  config.pin_d7 = 35;
  config.pin_xclk = 0;
  config.pin_pclk = 22;
  config.pin_vsync = 25;
  config.pin_href = 23;
  config.pin_sscb_sda = 26;
  config.pin_sscb_scl = 27;
  config.pin_pwdn = 32;
  config.pin_reset = -1;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 10;
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return false;
  }
  return true;
}

void sendCapturedImage() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  // Convert the captured image to a Base64 string
  String imageBase64 = base64::encode(fb->buf, fb->len);
  esp_camera_fb_return(fb);  // Return the frame buffer to free memory

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Create a JSON payload with the Base64 image data
    String payload = "{\"image\":\"" + imageBase64 + "\"}";

    int httpResponseCode = http.POST(payload);
    if (httpResponseCode > 0) {
      Serial.printf("Image sent successfully. Response code: %d\n", httpResponseCode);
    } else {
      Serial.printf("Failed to send image. Error code: %d\n", httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}
void fetchFaceMatchResult() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(resultUrl);

    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Face match result from server: " + response);

      // Check for "allow" or "deny" status in the response
      if (response.indexOf("\"status\":\"allow\"") != -1) {
            Serial.println("Access allowed. ");
             digitalWrite(greenLED, HIGH);  // Turn on green LED
             digitalWrite(redLED, LOW);    // Turn off red LED
              digitalWrite(solenoidPin, HIGH);
              delay(2000);
                digitalWrite(solenoidPin, LOW);// Open solenoid lock
       
      } else if (response.indexOf("\"status\":\"deny\"") != -1) {
        Serial.println("Access denied.");
        digitalWrite(greenLED, LOW);  // Turn off green LED
        digitalWrite(redLED, HIGH);   // Turn on red LED
        digitalWrite(solenoidPin, LOW); // Keep solenoid lock closed
        
      }
    } else {
      Serial.println("Failed to get response: " + String(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("WiFi not connected");
  }

}

void loop() {
  sendCapturedImage();  // Capture and send image
  delay(10000);         // Wait 10 seconds before the next image capture
  fetchFaceMatchResult();
  delay(10000); 
  
  // Wait 5 seconds before the next POST request
}