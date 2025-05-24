import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Ensure API key is set as an environment variable in Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'API key not configured.' });
  }

  const { userPrompt, generationConfig, responseSchema } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const requestPayload = {
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: generationConfig // Pass generationConfig from frontend
    };

    // Conditionally add responseMimeType and responseSchema if provided
    if (responseSchema && Object.keys(responseSchema).length > 0) {
        requestPayload.generationConfig.responseMimeType = "application/json";
        requestPayload.generationConfig.responseSchema = responseSchema;
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