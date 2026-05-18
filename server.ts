import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Route for Gemini Metadata Suggestion
  app.post("/api/gemini/suggest-metadata", async (req, res) => {
    console.log("[Gemini] Received suggestion request...");
    try {
      const { imageBase64, mimeType } = req.body;

      if (!imageBase64) {
        console.error("[Gemini] No image data provided in request body");
        return res.status(400).json({ error: "No image data provided" });
      }

      console.log(`[Gemini] Calling model with image size: ${Math.round(imageBase64.length / 1024)} KB`);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: mimeType || "image/jpeg",
                },
              },
              {
                text: "Analyze this image and suggest realistic EXIF/IPTC metadata. Return a JSON object with these keys only: cameraModel, author, timestamp (YYYY:MM:DD HH:MM:SS), copyright, deviceInfo (serial), software, exposureTime (e.g. 1/125), fNumber (e.g. 2.8), iso (e.g. 400), gpsCoordinates (lat, lon). Ensure all values are strings.",
              },
            ],
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cameraModel: { type: Type.STRING },
              author: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              copyright: { type: Type.STRING },
              deviceInfo: { type: Type.STRING },
              software: { type: Type.STRING },
              exposureTime: { type: Type.STRING },
              fNumber: { type: Type.STRING },
              iso: { type: Type.STRING },
              gpsCoordinates: { type: Type.STRING },
            }
          }
        },
      });

      const text = response.text;
      if (!text) {
        console.warn("[Gemini] Empty response from model");
        return res.json({});
      }

      console.log("[Gemini] Model response received:", text.substring(0, 100) + "...");
      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("[Gemini] Error:", error);
      res.status(500).json({ error: error.message || "Failed to suggest metadata" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
