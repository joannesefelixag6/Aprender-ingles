import { GoogleGenAI, Type } from "@google/genai";
import { ProficiencyLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async generateVocabBatch(level: ProficiencyLevel, count: number = 5) {
    const isA1 = level === ProficiencyLevel.A1;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} essential English vocabulary words for ${level} level. 
      ${isA1 ? 'Since the user is an absolute beginner, focus on basic nouns, verbs, and greetings. ' : ''}
      For each word, provide: translation in Spanish, definition in simple English, and one easy example sentence.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              translation: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING },
            },
            required: ["word", "translation", "definition", "example"],
          },
        },
      },
    });

    return JSON.parse(response.text);
  },

  async generateGrammarExercises(level: ProficiencyLevel, count: number = 3) {
    const isA1 = level === ProficiencyLevel.A1;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} interactive grammar multiple-choice exercises for English learners at ${level} level. 
      ${isA1 ? 'Focus on extremely basic concepts like "to be", personal pronouns, and present simple. Provide the explanation in a way that a beginner can understand, referencing Spanish equivalents if helpful. ' : ''}
      Include tricky but fair questions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["question", "options", "correctAnswer", "explanation"],
          },
        },
      },
    });

    return JSON.parse(response.text);
  },

  async analyzePronunciation(targetText: string, recognizedText: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The student was supposed to say: "${targetText}".
      They actually said: "${recognizedText}".
      Analyze the pronunciation quality. 
      Return a response with a score from 0 to 100 and a brief feedback message in English.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
          },
          required: ["score", "feedback"],
        },
      },
    });

    return JSON.parse(response.text);
  }
};
