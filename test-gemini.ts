import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A highly detailed, photorealistic cinematic shot of an authentic gold prospector panning for gold in a clear mountain river. Warm golden hour lighting, cinematic composition, hyper-detailed, beautiful nature background, glowing gold nuggets in the pan. Professional photography, National Geographic style.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log('Image generated successfully');
        return;
      }
    }
    console.log('No image data found in response');
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
