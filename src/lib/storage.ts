import { Storage } from "@google-cloud/storage";

const credentials = JSON.parse(
  Buffer.from(process.env.GCS_KEY_BASE64 || "", "base64").toString()
);

const storage = new Storage({ credentials });
const bucket = storage.bucket(process.env.GCS_BUCKET || "seoulface-data");

export async function saveAnalysisData(
  analysisResult: Record<string, unknown>
) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const date = new Date().toISOString().split("T")[0];

  try {
    // 분석 결과만 저장 (사진 저장 안 함 — 개인정보 보호)
    const resultPath = `results/${date}/${id}.json`;
    await bucket.file(resultPath).save(
      JSON.stringify({
        id,
        timestamp: new Date().toISOString(),
        analysis: analysisResult,
      }),
      { contentType: "application/json" }
    );

    console.log(`[GCS] Saved: ${id} (result only, no photo)`);
    return id;
  } catch (error) {
    console.error("[GCS] Save failed:", error);
    return null;
  }
}
