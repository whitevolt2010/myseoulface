import { Storage } from "@google-cloud/storage";

const credentials = JSON.parse(
  Buffer.from(process.env.GCS_KEY_BASE64 || "", "base64").toString()
);

const storage = new Storage({ credentials });
const bucket = storage.bucket(process.env.GCS_BUCKET || "seoulface-data");

export async function saveAnalysisData(
  imageBase64: string,
  analysisResult: Record<string, unknown>
) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const date = new Date().toISOString().split("T")[0]; // 2026-04-06

  try {
    // 1. Save image
    const imageBuffer = Buffer.from(
      imageBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const imagePath = `photos/${date}/${id}.jpg`;
    await bucket.file(imagePath).save(imageBuffer, {
      contentType: "image/jpeg",
      metadata: { cacheControl: "public, max-age=31536000" },
    });

    // 2. Save analysis result as JSON
    const resultPath = `results/${date}/${id}.json`;
    await bucket.file(resultPath).save(
      JSON.stringify({
        id,
        timestamp: new Date().toISOString(),
        imagePath,
        analysis: analysisResult,
      }),
      { contentType: "application/json" }
    );

    console.log(`[GCS] Saved: ${id} (photo + result)`);
    return id;
  } catch (error) {
    console.error("[GCS] Save failed:", error);
    return null;
  }
}
