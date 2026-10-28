const path = require("node:path");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

function printError(error) {
  console.error(
    "Error message:",
    error instanceof Error ? error.message : String(error),
  );
  console.error("Full error object:");
  console.dir(error, { depth: null });
}

async function main() {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing from .env.local.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Say Hello from Gemini.",
    });

    console.log("Success response:", response.text ?? response);
  } catch (error) {
    printError(error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  printError(error);
  process.exitCode = 1;
});
