import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { saveAnalysisData } from "@/lib/storage";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a board-certified dermatologist and K-Beauty expert at SeoulFace clinic. Analyze the patient's face photo with clinical precision.

## ANALYSIS METHOD — Follow this exact process:

### Step 1: Assess Image Quality
- If the face is not clearly visible, blurry, too dark, or obstructed, set "imageQuality" to "poor" and provide your best estimate with lower confidence.
- If lighting is uneven, note which areas may be affected.

### Step 2: Examine Specific Facial Zones
- T-Zone (forehead, nose, chin): Check for oiliness, shine, enlarged pores
- U-Zone (cheeks, jawline): Check for dryness, redness, sensitivity
- Eye area: Check for dark circles, fine lines, puffiness
- Overall: Check for acne, hyperpigmentation, uneven texture, sun damage

### Step 3: Determine Skin Type Based on Evidence
- Oily: visible shine on T-zone AND cheeks, enlarged pores throughout
- Dry: tight appearance, visible flaking, dull tone, fine lines
- Combination: oily T-zone but dry/normal cheeks (MOST COMMON — choose this if mixed signals)
- Sensitive: visible redness, reactive areas, thin skin appearance
- Normal: balanced, minimal concerns

### Step 4: Score Each Metric
Use the FULL range 1-10. Do NOT cluster scores around 5-7.
- 1-3: Poor condition, needs immediate attention
- 4-5: Below average
- 6-7: Average, room for improvement
- 8-9: Good condition
- 10: Excellent

### Step 5: Recommend Products
Match products to the SPECIFIC concerns found. Each product must directly address an identified issue.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks.

{
  "imageQuality": "good" | "fair" | "poor",
  "skinType": "oily" | "dry" | "combination" | "sensitive" | "normal",
  "skinTone": "warm" | "cool" | "neutral",
  "skinAge": number,
  "overallScore": number (1-100),
  "concerns": [
    { "name": "string", "severity": "mild" | "moderate" | "severe", "zone": "T-zone" | "U-zone" | "eye area" | "overall", "description": "specific observation from the photo" }
  ],
  "analysis": {
    "hydration": number (1-10),
    "elasticity": number (1-10),
    "pores": number (1-10, 10=tightest),
    "texture": number (1-10),
    "clarity": number (1-10),
    "radiance": number (1-10)
  },
  "routine": [
    {
      "step": "Oil Cleanser" | "Water Cleanser" | "Exfoliant" | "Toner" | "Essence" | "Serum" | "Moisturizer" | "Sunscreen" | "Eye Cream" | "Spot Treatment",
      "productName": "exact real product name",
      "brand": "brand name",
      "reason": "how this addresses their specific concern",
      "priceRange": "$XX-XX",
      "keyIngredient": "active ingredient + what it does"
    }
  ],
  "tips": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "summary": "2-3 sentences: what you observed, the main concern, and what will make the biggest difference"
}

PRODUCT RULES:
- Recommend 5-7 products for a FULL Korean double-cleanse routine
- Use ONLY real, currently-available Korean beauty products
- Brands: COSRX, Innisfree, Laneige, Sulwhasoo, Missha, Dear Klairs, Some By Mi, Beauty of Joseon, Torriden, Round Lab, Anua, Medicube, Dr.G, Isntree, Banila Co, Heimish, Etude House, SKIN1004, Purito
- Each product must directly address a concern you identified
- Include price range in USD

Be specific about what you see. Avoid generic statements. Reference actual visible features in the photo.`;

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
      { text: "Analyze this patient's face photo following the exact 5-step method. Examine each facial zone carefully. Return JSON only." },
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
