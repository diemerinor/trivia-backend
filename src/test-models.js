const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // Esto nos dirá exactamente qué nombres acepta tu cuenta
    const result = await genAI.getGenerativeModel({ model: "gemini-3-flash" }).listModels();
    console.log("--- MODELOS DISPONIBLES ---");
    result.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error("Error al listar:", e);
  }
}

listModels();