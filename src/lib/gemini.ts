import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateContentWithGemini(
  prompt: string,
  personality: string,
  options?: {
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
  },
): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }); // Specify the Flash model

    const generationConfig = {
      maxOutputTokens: options?.maxOutputTokens,
      temperature: options?.temperature,
      topP: options?.topP,
      topK: options?.topK,
      stopSequences: options?.stopSequences,
    };

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: personality + '\n' + prompt }] },
      ],
      generationConfig,
    });

    const response = result.response;

    if (response.promptFeedback?.blockReason) {
      console.error('Content blocked:', response.promptFeedback.blockReason);
      return null;
    }

    if (response.text()) {
      return response.text();
    } else {
      console.warn('No text returned from the model.');
      return null;
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return null;
  }
}
