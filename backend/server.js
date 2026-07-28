import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// JSON Schema for Gemini structured output
const tripSchema = {
  type: "object",
  properties: {
    tripTitle: { type: "string" },
    tripSummary: { type: "string" },
    destination: { type: "string" },
    durationDays: { type: "integer" },
    budgetLevel: { type: "string" },
    packingSuggestions: {
      type: "array",
      items: { type: "string" }
    },
    itinerary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dayNumber: { type: "integer" },
          dayTheme: { type: "string" },
          stops: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                time: { type: "string" },
                activity: { type: "string" },
                location: { type: "string" },
                description: { type: "string" },
                estimatedCost: { type: "string" },
                duration: { type: "string" },
                category: { type: "string" }
              },
              required: ["id", "time", "activity", "location", "description", "category"]
            }
          }
        },
        required: ["dayNumber", "dayTheme", "stops"]
      }
    }
  },
  required: ["tripTitle", "tripSummary", "destination", "durationDays", "packingSuggestions", "itinerary"]
};

// You can paste a default API key here as a fallback (optional)
// WARNING: Avoid committing real keys to public repositories.
const DEFAULT_API_KEY = process.env.DEFAULT_API_KEY || ''; // Use environment variable or leave empty

// Helper function to initialize Gemini client
const getGeminiClient = (req, res) => {
  const apiKey = req.headers['x-api-key'] || process.env.GEMINI_API_KEY || DEFAULT_API_KEY;
  if (!apiKey) {
    res.status(401).json({
      error: "API Key Missing",
      message: "Please set GEMINI_API_KEY in your backend .env file, specify DEFAULT_API_KEY in server.js, or enter it in the app settings in the top-right header."
    });
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Root endpoint welcome message (prevents "Cannot GET /" on Render)
app.get('/', (req, res) => {
  res.send('🌌 Odyssey Trip Planner Backend Service is running successfully!');
});

// Test / Health check route
app.get('/api/health', (req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY || DEFAULT_API_KEY);
  res.json({ status: "healthy", serverApiKeyLoaded: hasKey });
});

// Endpoint: Generate itinerary from scratch
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing Prompt", message: "Please provide details for the trip." });
  }

  const genAI = getGeminiClient(req, res);
  if (!genAI) return; // Response already sent by getGeminiClient

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: tripSchema,
        temperature: 0.7,
      },
      systemInstruction: "You are an expert travel planner. Generate an engaging, highly detailed, and interactive day-by-day travel itinerary based on the user's description. The estimatedCost field should be a readable string like 'Free', '$15 USD', or '$50 for dinner'. The id field must be a unique string (you can generate a random unique ID, e.g. 'stop-1', 'stop-2', etc. or using timestamps). Keep the activities realistic, including travel time. The category field must be one of: 'Sightseeing', 'Food', 'Relaxation', 'Adventure', 'Transit', 'Shopping', or 'Other'."
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    // Attempt parsing. If it parses correctly, return it.
    // If not, we still send the text back, and our frontend error handling will process it.
    try {
      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch (parseError) {
      console.error("JSON parsing error on model output:", parseError, text);
      res.status(502).json({
        error: "Malformed LLM Response",
        message: "The model returned an invalid JSON string. It can be viewed or repaired in the debugger.",
        rawOutput: text
      });
    }
  } catch (error) {
    console.error("Gemini API generation error:", error);
    res.status(500).json({
      error: "LLM Generation Failed",
      message: error.message || "Failed to generate itinerary. Check API key and connection."
    });
  }
});

// Endpoint: Refine existing itinerary based on prompt
app.post('/api/refine', async (req, res) => {
  const { currentItinerary, refinementPrompt } = req.body;
  if (!currentItinerary || !refinementPrompt) {
    return res.status(400).json({ error: "Missing Data", message: "Please provide both currentItinerary and refinementPrompt." });
  }

  const genAI = getGeminiClient(req, res);
  if (!genAI) return;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: tripSchema,
        temperature: 0.5,
      },
      systemInstruction: "You are an expert travel planner. You modify existing itineraries based on user refinement requests. You MUST output the entire updated itinerary JSON adhering strictly to the provided schema. Do not change parts of the itinerary that the user did not request to change. Ensure all generated stops have unique 'id' values. Maintain the schema integrity."
    });

    const prompt = `Here is the current itinerary JSON state:
${JSON.stringify(currentItinerary, null, 2)}

User request for refinement:
"${refinementPrompt}"

Please update the itinerary according to the user request. Return the entire modified itinerary as JSON.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    try {
      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch (parseError) {
      console.error("JSON parsing error on model refinement output:", parseError, text);
      res.status(502).json({
        error: "Malformed LLM Response",
        message: "The model returned an invalid JSON string during refinement. It can be viewed or repaired in the debugger.",
        rawOutput: text
      });
    }
  } catch (error) {
    console.error("Gemini API refinement error:", error);
    res.status(500).json({
      error: "LLM Refinement Failed",
      message: error.message || "Failed to refine the itinerary. Check API key and connection."
    });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Odyssey Backend Server running on port ${PORT}`);
  });
}

export default app;
