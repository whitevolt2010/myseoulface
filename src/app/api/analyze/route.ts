import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { saveAnalysisData } from "@/lib/storage";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are SeoulFace AI, a professional K-Beauty skin analyst. Analyze the user's face photo and provide a detailed skin analysis with Korean skincare product recommendations.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no extra text.

Return this exact JSON structure:
{
  "skinType": "oily" | "dry" | "combination" | "sensitive" | "normal",
  "skinTone": "warm" | "cool" | "neutral",
  "skinAge": number (estimated skin age),
  "overallScore": number (1-100, skin health score),
  "concerns": [
    { "name": "string", "severity": "mild" | "moderate" | "severe", "description": "1 sentence" }
  ],
  "analysis": {
    "hydration": number (1-10),
    "elasticity": number (1-10),
    "pores": number (1-10, 10=smallest),
    "texture": number (1-10),
    "clarity": number (1-10),
    "radiance": number (1-10)
  },
  "routine": [
    {
      "step": "Cleanser" | "Toner" | "Serum" | "Moisturizer" | "Sunscreen" | "Eye Cream",
      "productName": "specific Korean product name (real product)",
      "brand": "Korean brand name",
      "reason": "why this product suits their skin",
      "priceRange": "$10-20",
      "keyIngredient": "main ingredient"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "summary": "2-3 sentence personalized summary of their skin condition and what to focus on"
}

Recommend 5-6 real Korean beauty products from brands like:
COSRX, Innisfree, Laneige, Sulwhasoo, Missha, Etude House, Dear Klairs, Some By Mi, Beauty of Joseon, Torriden, Round Lab, Anua, Medicube, Dr.G, Isntree, Banila Co, Heimish

Be specific with real product names. Be encouraging and positive in tone.`;

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
      { text: "Analyze this face photo and return the JSON result." },
    ]);

    const text = result.response.text();

    // Parse JSON from response (handle potential markdown wrapping)
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    jsonStr = jsonStr.trim();

    const data = JSON.parse(jsonStr);

    // 분석 결과만 저장 (사진 없이)
    saveAnalysisData(data).catch(() => {});

    return Response.json(data);
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
