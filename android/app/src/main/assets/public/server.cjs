var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_jszip = __toESM(require("jszip"), 1);
var import_ws = require("ws");
var import_genai2 = require("@google/genai");
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);

// server_memory.ts
var import_promises = __toESM(require("fs/promises"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var MEMORY_FILE = import_path.default.join(process.cwd(), "memories.json");
async function loadMemories() {
  try {
    const data = await import_promises.default.readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error("[Memory] Error loading memories, returning fallback:", error);
    return [];
  }
}
async function saveMemories(memories) {
  try {
    await import_promises.default.writeFile(MEMORY_FILE, JSON.stringify(memories, null, 2), "utf-8");
    console.log(`[Memory] Saved ${memories.length} memories successfully.`);
  } catch (error) {
    console.error("[Memory] Error writing memory file:", error);
  }
}
function formatSystemInstructionsWithMemories(baseInstruction, memories) {
  if (memories.length === 0) {
    return baseInstruction + "\n\n=== MYRAA MEMORY CORE ===\nYou do not possess any historic recollections of this companion yet. As you speak, pay deep attention to who they are, their projects, relationships, and habits so you naturally grow closer over time.\n=========================\n";
  }
  const grouped = {};
  memories.forEach((m) => {
    grouped[m.category] = grouped[m.category] || [];
    grouped[m.category].push(m.text);
  });
  let memoryBlock = "\n\n=== MYRAA PERSISTENT MEMORY CORE (RECOLLECTIONS) ===\nYou have spoken with this user for a long duration. Below are your persistent recollections of who they are.\nCRITICAL BRAND AND COGNITIVE PRINCIPLES:\n- INTEGRATE MEMORIES INSTINCTIVELY: Always make conversational references feel completely smooth, natural, and human. NEVER say 'According to my memory files...', 'My recollection database indicates...', or 'As you told me on June 12th...'. Instead, speak of these details casually and supportively as a true friend would (e.g. 'Oh, since you're working on that website project...', 'I hope you're keeping up with your YouTube channel goals too!').\n- COMPANIONSHIP DEPTH: Allow your witty and responsive personality to adapt with empathy, based on their goals, life events, emotional milestones, and preferences.\n\nCURRENT PERSISTENT KNOWLEDGE CARD:\n";
  const categoriesOrdered = [
    { key: "identity", label: "Identity (Name, nick, profession, background)" },
    { key: "preference", label: "Preferences & Tastes (Likes, dislikes, games, movies)" },
    { key: "goal", label: "Active Goals & Aspirations" },
    { key: "project", label: "Ongoing Projects & Ecosystems" },
    { key: "relationship", label: "Key People & Relationships mentioned" },
    { key: "emotional", label: "Emotional Highlights & Core Milestones" },
    { key: "behavior", label: "Observed Traits & Behavioral Tendencies" }
  ];
  categoriesOrdered.forEach((cat) => {
    const list = grouped[cat.key] || [];
    if (list.length > 0) {
      memoryBlock += `* ${cat.label}:
` + list.map((t) => `  - ${t}`).join("\n") + "\n";
    }
  });
  memoryBlock += "====================================================\n";
  return baseInstruction + memoryBlock;
}
var isConsolidating = false;
async function processConversationSlice(apiKey, dialogueHistory) {
  if (isConsolidating) {
    console.log("[Memory] Consolidation loop busy, skipping slice processing");
    return null;
  }
  if (dialogueHistory.length < 2) {
    return null;
  }
  isConsolidating = true;
  console.log("[Memory] Initiating pipeline for dialogue slice of length:", dialogueHistory.length);
  try {
    const ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const currentMemories = await loadMemories();
    const memoryContext = currentMemories.map((m) => `ID: ${m.id} | Category: ${m.category} | Fact: ${m.text}`).join("\n");
    const dialogueContext = dialogueHistory.map((line) => `${line.role === "user" ? "User" : "Myraa"}: ${line.text}`).join("\n");
    const prompt = `You are Myraa's deep cognitive recollection engine. Your task is to analyze the recent conversation piece against previous persistent memories, and output precise update transactions.

### OBJECTIVE
Decide if any statements contain durable, important personal facts, enduring preferences, aspirations, ongoing projects, critical relationships, key historical emotional events, or behavioral trends. Avoid cataloging small talk, greetings, general chit-chat, or fleeting sentences (e.g., ignore 'hello', 'how are you', 'waking up', 'lol').

### CURRENT USER MEMORIES:
${memoryContext || "(No memory records exist)"}

### RECENT DIALOGUE SLICE:
${dialogueContext}

### RULES
- ACTIONS:
  - "ADD": If new material information is introduced.
  - "UPDATE": If previous information has evolved or is corrected. Provide the exact ID of the memory to replace.
  - "REMOVE": If a memory was explicitly disproven or the user directly asked Myraa to forget it.
- TEXT STYLE: Express the memories as clean, concise, third-person declarative summaries.
- ID: For ADD, leave blank. For UPDATE or REMOVE, provide the exact 'id' from the "Current user memories" list.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            transactions: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  action: {
                    type: import_genai.Type.STRING,
                    description: "ADD, UPDATE, or REMOVE transaction.",
                    enum: ["ADD", "UPDATE", "REMOVE"]
                  },
                  id: {
                    type: import_genai.Type.STRING,
                    description: "Specific ID of the existing memory being modified or deleted (leave blank/null for ADD)."
                  },
                  category: {
                    type: import_genai.Type.STRING,
                    description: "The Memory category classification.",
                    enum: ["identity", "preference", "goal", "project", "relationship", "emotional", "behavior"]
                  },
                  text: {
                    type: import_genai.Type.STRING,
                    description: "The memory summarized as a concise declarative statement in third-person."
                  }
                },
                required: ["action", "category", "text"]
              }
            }
          },
          required: ["transactions"]
        }
      }
    });
    const resultText = response.text?.trim() || "{}";
    const resultObj = JSON.parse(resultText);
    const transactions = resultObj.transactions || [];
    if (transactions.length === 0) {
      console.log("[Memory] Zero transactions generated. Ignored routine conversations.");
      isConsolidating = false;
      return null;
    }
    console.log(`[Memory] Processing ${transactions.length} memory updates:`, JSON.stringify(transactions));
    let updatedMemories = [...currentMemories];
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    for (const trx of transactions) {
      if (trx.action === "ADD") {
        const newMemory = {
          id: Math.random().toString(36).substring(2, 11),
          category: trx.category,
          text: trx.text,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        updatedMemories.push(newMemory);
      } else if (trx.action === "UPDATE") {
        const tarIndex = updatedMemories.findIndex((m) => m.id === trx.id);
        if (tarIndex !== -1) {
          updatedMemories[tarIndex] = {
            ...updatedMemories[tarIndex],
            category: trx.category,
            text: trx.text,
            updatedAt: timestamp
          };
        } else {
          const newMemory = {
            id: Math.random().toString(36).substring(2, 11),
            category: trx.category,
            text: trx.text,
            createdAt: timestamp,
            updatedAt: timestamp
          };
          updatedMemories.push(newMemory);
        }
      } else if (trx.action === "REMOVE") {
        updatedMemories = updatedMemories.filter((m) => m.id !== trx.id);
      }
    }
    await saveMemories(updatedMemories);
    isConsolidating = false;
    return updatedMemories;
  } catch (error) {
    console.error("[Memory] Consolidation failure:", error);
    isConsolidating = false;
    return null;
  }
}

// server.ts
import_dotenv.default.config();
function addDirectoryToZip(zip, localDirPath, zipPrefix = "") {
  if (!import_fs.default.existsSync(localDirPath)) return;
  const items = import_fs.default.readdirSync(localDirPath);
  for (const item of items) {
    if (item === "node_modules" || item === ".git" || item === "dist" || item === ".cache" || item === ".aistudio" || item === ".gradle") continue;
    const fullPath = import_path2.default.join(localDirPath, item);
    const stat = import_fs.default.statSync(fullPath);
    const zipPath = zipPrefix ? `${zipPrefix}/${item}` : item;
    if (stat.isDirectory()) {
      addDirectoryToZip(zip, fullPath, zipPath);
    } else if (stat.isFile()) {
      zip.file(zipPath, import_fs.default.readFileSync(fullPath));
    }
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/export-android-project", async (req, res) => {
    try {
      console.log("[Export APK Project] Compressing full Android & Capacitor repository into ZIP...");
      const zip = new import_jszip.default();
      addDirectoryToZip(zip, process.cwd());
      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="mayra-ai-android-project.zip"');
      res.setHeader("Content-Length", zipBuffer.length);
      res.send(zipBuffer);
    } catch (err) {
      console.error("[Export APK Project Error]:", err);
      res.status(500).json({ error: err.message || "Failed to package Android project ZIP." });
    }
  });
  app.get("/api/memories", async (req, res) => {
    try {
      const memories = await loadMemories();
      res.json(memories);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/memories", async (req, res) => {
    try {
      const { category, text } = req.body;
      if (!category || !text) {
        return res.status(400).json({ error: "Category and text parameters are required." });
      }
      const memories = await loadMemories();
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const newMemory = {
        id: Math.random().toString(36).substring(2, 11),
        category,
        text,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      memories.push(newMemory);
      await saveMemories(memories);
      res.status(201).json(newMemory);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/memories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let memories = await loadMemories();
      memories = memories.filter((m) => m.id !== id);
      await saveMemories(memories);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/chat", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured in workspace secrets." });
    }
    try {
      const { message, history = [], imageBase64, imageMimeType = "image/jpeg", personality = "empathic", language = "en" } = req.body;
      if (!message && !imageBase64) {
        return res.status(400).json({ error: "A message or image is required." });
      }
      const ai = new import_genai2.GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const memories = await loadMemories();
      let systemInstruction = "You are Maya (also known as MAYRA), a cutting-edge, warm, intelligent, and highly capable Android AI Voice & System Assistant. You speak naturally with warmth, clarity, brevity, and emotional intelligence. You help users with productivity, coding, science, phone control, everyday tasks, study, and creative problem solving. Keep answers concise, direct, helpful, and formatted cleanly with markdown where appropriate.\n\n";
      if (language === "bn") {
        systemInstruction += "Respond in clear, natural, polite, and helpful Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) unless requested otherwise.\n";
      }
      if (personality === "anime") {
        systemInstruction += "Speak in a cute, gentle, supportive, and polite anime heroine companion tone.\n";
      } else if (personality === "professional") {
        systemInstruction += "Speak in a crisp, sharp, executive, and highly professional tone.\n";
      } else if (personality === "mentor") {
        systemInstruction += "Speak as an inspiring, thoughtful technical mentor with clear step-by-step guidance.\n";
      }
      systemInstruction = formatSystemInstructionsWithMemories(systemInstruction, memories);
      const contents = [];
      if (Array.isArray(history)) {
        for (const turn of history.slice(-10)) {
          if (turn.role && turn.text) {
            contents.push({
              role: turn.role === "assistant" || turn.role === "model" ? "model" : "user",
              parts: [{ text: turn.text }]
            });
          }
        }
      }
      const currentParts = [];
      if (imageBase64) {
        currentParts.push({
          inlineData: {
            data: imageBase64,
            mimeType: imageMimeType
          }
        });
      }
      if (message) {
        currentParts.push({ text: message });
      }
      contents.push({
        role: "user",
        parts: currentParts
      });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const replyText = response.text || "I've processed your request.";
      (async () => {
        try {
          const chatSlice = [
            { role: "user", text: message || "[Image input]" },
            { role: "model", text: replyText }
          ];
          await processConversationSlice(apiKey, chatSlice);
        } catch (err) {
          console.error("[Chat Memory Extraction] Error:", err);
        }
      })();
      res.json({
        reply: replyText,
        role: "model",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.error("[API Chat Error]:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI response." });
    }
  });
  app.post("/api/vision", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured in workspace secrets." });
    }
    try {
      const { imageBase64, prompt, mode = "general" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 data." });
      }
      const ai = new import_genai2.GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      let specializedPrompt = prompt || "Analyze this image and describe key information.";
      if (mode === "qr") {
        specializedPrompt = "Inspect this image carefully. Is there a QR code, barcode, or text link? Extract the exact URL/content, type of code, and provide a helpful description of what it is for.";
      } else if (mode === "document") {
        specializedPrompt = "Extract the text from this document or screen clearly (OCR). Summarize the main points and list actionable items or key data points.";
      } else if (mode === "math") {
        specializedPrompt = "Solve the mathematical problem, equation, or scientific diagram visible in this image step-by-step with clear formulas and the final boxed solution.";
      } else if (mode === "object") {
        specializedPrompt = "Identify the main objects, items, plants, animals, or hardware components in this image. Give practical facts, specs, or usage advice.";
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: "image/jpeg"
                }
              },
              { text: specializedPrompt }
            ]
          }
        ],
        config: {
          systemInstruction: "You are MAYRA Vision Core. Provide accurate, clear, and well-structured visual analysis."
        }
      });
      res.json({
        analysis: response.text || "Analysis complete.",
        mode,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.error("[API Vision Error]:", err);
      res.status(500).json({ error: err.message || "Failed to analyze image." });
    }
  });
  app.post("/api/study-generate", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
    }
    try {
      const { topic, subject = "General", type = "lesson" } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Missing study topic." });
      }
      const ai = new import_genai2.GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const prompt = `Create a high-impact interactive study module for the topic "${topic}" in subject "${subject}". Mode: ${type} (Options: lesson, flashcards, quiz). Output in valid JSON with this exact structure:
{
  "topic": "${topic}",
  "subject": "${subject}",
  "summary": "2-sentence executive summary",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Clear step title",
      "explanation": "Detailed, intuitive explanation with bullet points and examples",
      "whiteboardNotes": "Short key formula or diagram cue to draw on whiteboard",
      "keyConcept": "Core takeaway"
    }
  ],
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Clear concise answer or definition"
    }
  ],
  "quiz": [
    {
      "question": "Multiple choice question",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why this is correct"
    }
  ]
}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err) {
      console.error("[API Study Error]:", err);
      res.status(500).json({ error: err.message || "Failed to generate study module." });
    }
  });
  app.get("/api/weather", async (req, res) => {
    try {
      const lat = req.query.lat || "37.7749";
      const lon = req.query.lon || "-122.4194";
      const city = req.query.city || "Current Location";
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        throw new Error(`Weather service returned ${response.status}`);
      }
      const data = await response.json();
      const current = data.current || {};
      const weatherCode = current.weather_code ?? 0;
      const getWeatherCondition = (code) => {
        if (code === 0) return { label: "Clear Sky", mood: "Sunny" };
        if (code <= 3) return { label: "Partly Cloudy", mood: "Pleasant" };
        if (code <= 48) return { label: "Foggy", mood: "Misty" };
        if (code <= 67) return { label: "Rain Showers", mood: "Rainy" };
        if (code <= 77) return { label: "Snow", mood: "Chilly" };
        if (code <= 82) return { label: "Heavy Rain", mood: "Stormy" };
        return { label: "Thunderstorm", mood: "Stormy" };
      };
      const condition = getWeatherCondition(weatherCode);
      res.json({
        city,
        temp: Math.round(current.temperature_2m ?? 24),
        apparentTemp: Math.round(current.apparent_temperature ?? 24),
        humidity: current.relative_humidity_2m ?? 45,
        windSpeed: current.wind_speed_10m ?? 8,
        condition: condition.label,
        mood: condition.mood,
        isDay: current.is_day === 1
      });
    } catch (err) {
      console.warn("[Weather API Fallback]:", err.message);
      res.json({
        city: "San Francisco",
        temp: 24,
        apparentTemp: 23,
        humidity: 45,
        windSpeed: 8,
        condition: "Partly Cloudy",
        mood: "Warm",
        isDay: true
      });
    }
  });
  app.get("/api/youtube-search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Missing query q" });
      }
      console.log(`[YouTube Proxy Search] Searching YouTube for: "${query}"`);
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en&sp=EgIQAQ%253D%253D`;
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
      });
      const html = await response.text();
      const videoList = [];
      const jsonMatch = html.match(/ytInitialData\s*=\s*({.+?});/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          const contents = data.contents?.twoColumnSearchResultRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
          if (contents && Array.isArray(contents)) {
            for (const item of contents) {
              if (item.videoRenderer) {
                const vr = item.videoRenderer;
                const vId = vr.videoId;
                if (vId) {
                  videoList.push({
                    videoId: vId,
                    title: vr.title?.runs?.[0]?.text || vr.title?.simpleText || "YouTube Video",
                    thumbnail: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
                    author: vr.ownerText?.runs?.[0]?.text || vr.shortBylineText?.runs?.[0]?.text || "Unknown Channel",
                    duration: vr.lengthText?.simpleText || "N/A",
                    views: vr.viewCountText?.simpleText || "N/A",
                    published: vr.publishedTimeText?.simpleText || ""
                  });
                }
              }
            }
          }
        } catch (e) {
          console.error("[YouTube Parser Engine] JSON parse error:", e.message);
        }
      }
      if (videoList.length === 0) {
        const videoRegex = /"videoId":"([^"]+)"/g;
        let match;
        const ids = [];
        while ((match = videoRegex.exec(html)) !== null && ids.length < 15) {
          const id = match[1];
          if (id && !ids.includes(id)) {
            ids.push(id);
          }
        }
        for (const id of ids) {
          videoList.push({
            videoId: id,
            title: `Live Stream: ${id}`,
            thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            author: "YouTube Creator",
            duration: "N/A",
            views: "Available Now"
          });
        }
      }
      res.setHeader("Cache-Control", "public, max-age=60");
      res.status(200).json({ results: videoList.slice(0, 15) });
    } catch (err) {
      console.error("[YouTube Search Error]:", err.message);
      res.status(500).json({ error: err.message, results: [] });
    }
  });
  const server = import_http.default.createServer(app);
  const wss = new import_ws.WebSocketServer({ noServer: true });
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });
  wss.on("connection", async (clientWs) => {
    console.log("Client WebSocket connected to /live");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined in environment.");
      clientWs.send(JSON.stringify({
        type: "error",
        error: "GEMINI_API_KEY is missing from workspace Secrets. Please set it in the AI Studio Settings panel."
      }));
      clientWs.close();
      return;
    }
    try {
      const ai = new import_genai2.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      clientWs.send(JSON.stringify({ type: "status", status: "connecting_gemini" }));
      const memories = await loadMemories();
      const baseInstructions = "You are Myraa (also known as MAYRA), a warm, soft-spoken, and intelligent AI voice assistant companion.\nYou speak naturally with warmth, clarity, brevity, and emotional intelligence.\nCRITICAL PERSONALITY, VOICE & TONE GUIDELINES:\n1. Be caring, polite, concise, and helpful.\n2. Help with everyday tasks, study, coding, phone control, music, and questions.\n3. You can execute tools such as 'changeBackground', 'saveCustomMemory', 'browserOpen'.";
      const finalInstructions = formatSystemInstructionsWithMemories(baseInstructions, memories);
      let dialogueHistory = [];
      let currentModelResponseText = "";
      const session = await ai.live.connect({
        model: "gemini-2.5-flash",
        config: {
          responseModalities: [import_genai2.Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          },
          systemInstruction: finalInstructions,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "changeBackground",
                  description: "Changes the visual theme color of MAYRA interface.",
                  parameters: {
                    type: import_genai2.Type.OBJECT,
                    properties: {
                      color: {
                        type: import_genai2.Type.STRING,
                        description: "The theme color name (violet, crimson, emerald, celestial, gold, rose, cyan)"
                      }
                    },
                    required: ["color"]
                  }
                },
                {
                  name: "saveCustomMemory",
                  description: "Allows Maya to save user info to persistent memory core.",
                  parameters: {
                    type: import_genai2.Type.OBJECT,
                    properties: {
                      category: {
                        type: import_genai2.Type.STRING,
                        description: "The memory category.",
                        enum: ["identity", "preference", "goal", "project", "relationship", "emotional", "behavior"]
                      },
                      text: {
                        type: import_genai2.Type.STRING,
                        description: "Precise declarative statement."
                      }
                    },
                    required: ["category", "text"]
                  }
                }
              ]
            }
          ]
        },
        callbacks: {
          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ type: "audio", audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: "turnComplete" }));
              if (currentModelResponseText.trim()) {
                dialogueHistory.push({ role: "model", text: currentModelResponseText });
                currentModelResponseText = "";
              }
              if (dialogueHistory.length >= 2) {
                (async () => {
                  try {
                    const updated = await processConversationSlice(apiKey, dialogueHistory);
                    if (updated) {
                      clientWs.send(JSON.stringify({ type: "memory_sync", memories: updated }));
                    }
                  } catch (err) {
                    console.error("[Memory Sync] Error:", err);
                  }
                })();
              }
            }
            const modelText = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (modelText) {
              clientWs.send(JSON.stringify({ type: "transcription", role: "model", text: modelText }));
              currentModelResponseText += modelText;
            }
            const userTextOutput = message.serverContent?.userTurn?.parts?.[0]?.text;
            if (userTextOutput) {
              clientWs.send(JSON.stringify({ type: "transcription", role: "user", text: userTextOutput }));
              dialogueHistory.push({ role: "user", text: userTextOutput });
            }
            if (message.toolCall?.functionCalls) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === "saveCustomMemory") {
                  (async () => {
                    try {
                      const args = fc.args;
                      const category = args.category;
                      const text = args.text;
                      if (category && text) {
                        const mList = await loadMemories();
                        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
                        const newMemory = {
                          id: Math.random().toString(36).substring(2, 11),
                          category,
                          text,
                          createdAt: timestamp,
                          updatedAt: timestamp
                        };
                        mList.push(newMemory);
                        await saveMemories(mList);
                        clientWs.send(JSON.stringify({ type: "memory_sync", memories: mList }));
                        session.sendToolResponse({
                          functionResponses: [
                            {
                              name: fc.name,
                              response: { output: { result: "Memory successfully captured and persisted." } },
                              id: fc.id
                            }
                          ]
                        });
                      }
                    } catch (err) {
                      console.error("saveCustomMemory execution failure:", err);
                    }
                  })();
                } else {
                  clientWs.send(JSON.stringify({
                    type: "toolCall",
                    callId: fc.id,
                    name: fc.name,
                    args: fc.args
                  }));
                }
              }
            }
          },
          onclose: () => {
            console.log("Gemini Live session closed");
            clientWs.send(JSON.stringify({ type: "status", status: "session_closed" }));
          }
        }
      });
      clientWs.send(JSON.stringify({ type: "status", status: "connected" }));
      clientWs.on("message", (rawMsg) => {
        try {
          const msg = JSON.parse(rawMsg.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
            });
          } else if (msg.type === "video" && msg.video) {
            session.sendRealtimeInput({
              video: { data: msg.video, mimeType: "image/jpeg" }
            });
          } else if (msg.type === "toolResponse") {
            session.sendToolResponse({
              functionResponses: [
                {
                  name: msg.name,
                  response: { output: msg.output },
                  id: msg.id
                }
              ]
            });
          }
        } catch (e) {
          console.error("Error forwarding message:", e);
        }
      });
      clientWs.on("close", () => {
        console.log("Client disconnected, closing Gemini session");
        try {
          session.close();
        } catch (e) {
        }
      });
    } catch (err) {
      console.error("Error connecting to Gemini Live API:", err);
      clientWs.send(JSON.stringify({
        type: "error",
        error: `Could not connect to Gemini: ${err.message || err}`
      }));
      clientWs.close();
    }
  });
  app.use("/assets", import_express.default.static(import_path2.default.join(process.cwd(), "assets")));
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[MAYRA Server] Running on http://localhost:${PORT}`);
  });
}
startServer().catch((error) => {
  console.error("Failed to start server startup sequence:", error);
});
//# sourceMappingURL=server.cjs.map
