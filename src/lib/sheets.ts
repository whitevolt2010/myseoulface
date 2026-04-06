import { google } from "googleapis";

const SPREADSHEET_ID = "1iJT6frVXFwUd6X6id_Ff6mvxkggmxdKqAeVh1a5F3O8";
const SHEET_NAME = "시트1";

function getAuth() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GCS_KEY_BASE64 || "", "base64").toString()
  );
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function appendToSheet(data: {
  email?: string;
  skinType?: string;
  skinTone?: string;
  skinAge?: number;
  overallScore?: number;
  concerns?: Array<{ name: string; severity: string }>;
  imageQuality?: string;
}) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // 첫 행이 비어있으면 헤더 추가
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:A1`,
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:I1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [["Date", "Email", "Skin Type", "Skin Tone", "Skin Age", "Score", "Concerns", "Image Quality", "Timestamp"]],
        },
      });
    }

    const now = new Date();
    const date = now.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
    const timestamp = now.toISOString();
    const concerns = data.concerns?.map((c) => `${c.name}(${c.severity})`).join(", ") || "";

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          date,
          data.email || "",
          data.skinType || "",
          data.skinTone || "",
          data.skinAge || "",
          data.overallScore || "",
          concerns,
          data.imageQuality || "",
          timestamp,
        ]],
      },
    });

    console.log("[Sheets] Row added:", data.email);
  } catch (error) {
    console.error("[Sheets] Failed:", error);
  }
}
