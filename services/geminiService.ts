import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult, ComparisonResult } from "../types";

const ANALYSIS_PROMPT = `
  You are an expert legal decoder. Analyze this document and provide a deep summary.
  1. PERSONA: Identify who this document targets (e.g. Student, Freelancer, Employee, Startup, Consumer).
  2. SCORE: Provide a Complexity Score from 1-10.
  3. MULTILINGUAL: Provide a summary in English and Hindi.
  4. RISKS: Identify specific red flags (predatory clauses, hidden penalties, auto-renewals, privacy risks). 
     For EACH risk:
     - Quote the specific clause.
     - Explain WHY it's risky.
     - Provide a "Suggested Safer Alternative" (Action Recommendation).
  5. CARDS: Summarize key areas into cards: Termination, Payment, Liability, Data Usage, Jurisdiction.
  6. JARGON: Create a dictionary of 5+ complex terms found in the text.

  Return ONLY valid JSON matching the AnalysisResult structure.
`;

const COMPARISON_PROMPT = `
  You are a legal comparison engine. Compare Document A (Baseline) and Document B (New).
  Identify:
  1. What was ADDED, REMOVED, or MODIFIED.
  2. The IMPACT of each change (Positive, Negative, or Neutral).
  3. A summary of how the overall risk profile has shifted.
  
  Return ONLY valid JSON matching the ComparisonResult structure.
`;

export const analyzeLegalDocument = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: ANALYSIS_PROMPT }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 15000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING },
                hi: { type: Type.STRING }
              },
              required: ['en', 'hi']
            },
            complexityScore: { type: Type.NUMBER },
            persona: { type: Type.STRING },
            verdict: { type: Type.STRING, enum: ['Safe', 'Caution', 'Dangerous'] },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                  clause: { type: Type.STRING },
                  whyRisky: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                  alternativeClause: { type: Type.STRING }
                },
                required: ['category', 'description', 'severity', 'clause', 'whyRisky', 'recommendation']
              }
            },
            clauseCards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  icon: { type: Type.STRING }
                },
                required: ['title', 'summary', 'icon']
              }
            },
            hiddenFees: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedCost: { type: Type.STRING }
                },
                required: ['item', 'description']
              }
            },
            jargonTranslator: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  plainEnglish: { type: Type.STRING }
                },
                required: ['term', 'plainEnglish']
              }
            }
          },
          required: ['summary', 'complexityScore', 'persona', 'verdict', 'risks', 'clauseCards', 'hiddenFees', 'jargonTranslator']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned empty content");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Deep Analysis failed:", error);
    throw error;
  }
};

export const compareDocuments = async (file1: { data: string, mime: string, name: string }, file2: { data: string, mime: string, name: string }): Promise<ComparisonResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { text: `Document A (${file1.name}):` },
          { inlineData: { data: file1.data, mimeType: file1.mime } },
          { text: `Document B (${file2.name}):` },
          { inlineData: { data: file2.data, mimeType: file2.mime } },
          { text: COMPARISON_PROMPT }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            changes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['Added', 'Removed', 'Modified'] },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
                  originalText: { type: Type.STRING },
                  newText: { type: Type.STRING }
                },
                required: ['type', 'description', 'impact']
              }
            },
            riskShift: { type: Type.STRING }
          },
          required: ['summary', 'changes', 'riskShift']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Comparison returned empty content");
    const result = JSON.parse(text);
    return { ...result, baselineName: file1.name, comparisonName: file2.name } as ComparisonResult;
  } catch (error) {
    console.error("Comparison failed:", error);
    throw error;
  }
};

export const createChatSession = (docData: string, mimeType: string): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are a legal assistant trained to answer questions about the provided document. Use simple language. Be concise. If the user asks about risks, identify them clearly. Always add a disclaimer that you are an AI assistant and not a lawyer.",
    },
    history: [
      {
        role: "user",
        parts: [{ inlineData: { data: docData, mimeType: mimeType } }, { text: "Please read this document and prepare to answer my questions." }]
      }
    ]
  });
};