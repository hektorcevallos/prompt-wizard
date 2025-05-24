import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'API key not configured.' });
  }

  // Destructure userPrompt and generationConfig from req.body
  const { userPrompt, generationConfig } = req.body; // <-- MODIFIED THIS LINE

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const requestPayload = {
      // Build contents array correctly from the userPrompt
      contents: [{ role: "user", parts: [{ text: userPrompt }] }], // <-- MODIFIED THIS LINE
      generationConfig: generationConfig
    };

    // Conditionally add responseMimeType and responseSchema if provided
    // This part needs to be careful because generationConfig might be empty from generatePrompt
    if (generationConfig && generationConfig.responseMimeType && generationConfig.responseSchema) {
        requestPayload.generationConfig.responseMimeType = generationConfig.responseMimeType;
        requestPayload.generationConfig.responseSchema = generationConfig.responseSchema;
    } else if (generationConfig) { // Ensure generationConfig is not undefined
         requestPayload.generationConfig = generationConfig;
    } else {
         requestPayload.generationConfig = {}; // Default to empty if not provided
    }

    const result = await model.generateContent(requestPayload);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ generatedText: text });
  } catch (error) {
    console.error("Error calling LLM:", error.message);
    res.status(500).json({ message: 'Failed to generate content from LLM.', error: error.message });
  }
}