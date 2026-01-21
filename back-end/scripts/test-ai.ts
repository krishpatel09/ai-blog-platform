import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import * as dotenv from 'dotenv';
import { StringOutputParser } from '@langchain/core/output_parsers';

dotenv.config();

async function testAi() {
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log('Checking API Key:', apiKey ? 'Present' : 'Missing');

  if (!apiKey) {
    console.error('ERROR: GOOGLE_API_KEY is missing in .env');
    return;
  }

  // Debug: List available models
  try {
    console.log('Trying direct SDK with gemini-pro-vision...');
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    // Note: pro-vision needs image.
    // We already have image logic below for LangChain, let's just update the LangChain model name first to see if that fixes the main error.
    // Or we can try generating content with image here.
    const result = await model.generateContent('Hello?'); // This will likely fail for vision model without image
    console.log(
      "Direct SDK 'gemini-pro-vision' Success:",
      result.response.text(),
    );
  } catch (e) {
    console.log('SDK check failed', e.message);
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-pro-vision',
    maxOutputTokens: 2048,
  });

  const imageUrl = 'https://ik.imagekit.io/demo/default-image.jpg';
  console.log('Testing with image:', imageUrl);

  try {
    // Gemini requires base64 images for the 'image_url' part in some SDK versions or configurations.
    // Let's fetch the image and convert it.
    console.log('Fetching image...');
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok)
      throw new Error(`Failed to fetch image: ${imageResp.statusText}`);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const imageMessage = new HumanMessage({
      content: [
        {
          type: 'text',
          text: 'Describe this image in one sentence.',
        },
        {
          type: 'image_url',
          image_url: {
            url: dataUrl,
          },
        },
      ],
    });

    console.log('Sending request to Gemini...');
    const response = await model.invoke([imageMessage]);
    console.log('Response received:');
    console.log(response.content);

    console.log('\n--- Test Passed ---');
  } catch (error) {
    console.error('AI Request Failed:', error);
  }
}

testAi();
