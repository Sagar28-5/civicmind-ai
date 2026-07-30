const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const parseJSON = (text) => {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
};

// ─── Analyze a citizen complaint ─────────────────────────────────────────────
const analyzeComplaint = async (text, imageDesc = '') => {
  const prompt = `You are CivicMind AI, an intelligent civic complaint analyzer for smart city governance.
Analyze this citizen complaint and return ONLY a valid JSON object with no extra text.

Complaint Text: "${text}"
Image Description (if any): "${imageDesc}"

Return exactly this JSON structure:
{
  "category": "road|water|electricity|garbage|health|traffic|other",
  "subcategory": "string",
  "priority": "low|medium|high|critical",
  "priorityScore": 0-100,
  "urgencyReason": "string explaining urgency",
  "department": "PWD|Water Board|Electricity Board|Municipal Corporation|Health Department|Traffic Police",
  "summary": "2-sentence official summary of the complaint",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "sentiment": "frustrated|neutral|urgent|angry",
  "estimatedResolutionDays": number,
  "suggestedTitle": "short title for the complaint"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJSON(text);
    if (parsed) return parsed;
    throw new Error('Invalid JSON from Gemini');
  } catch (err) {
    // Fallback if API fails
    return {
      category: 'other',
      subcategory: 'General Issue',
      priority: 'medium',
      priorityScore: 50,
      urgencyReason: 'Requires attention',
      department: 'Municipal Corporation',
      summary: text.substring(0, 200),
      keywords: ['complaint', 'civic'],
      sentiment: 'neutral',
      estimatedResolutionDays: 3,
      suggestedTitle: text.substring(0, 60),
    };
  }
};

// ─── Predict upcoming issues ──────────────────────────────────────────────────
const predictIssues = async (statsData) => {
  const prompt = `You are CivicMind's predictive analytics engine. Based on this historical complaint data, predict the top 5 civic issues likely to occur in the next 7 days.

Historical Data: ${JSON.stringify(statsData)}

Return ONLY a JSON array:
[{
  "issue": "string",
  "category": "road|water|electricity|garbage|health|traffic",
  "probability": 0-100,
  "affectedAreas": ["area1", "area2"],
  "reasoning": "brief explanation",
  "preventiveAction": "recommended action"
}]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJSON(text);
    return Array.isArray(parsed) ? parsed : getDefaultPredictions();
  } catch {
    return getDefaultPredictions();
  }
};

// ─── ARIA Admin Chat ──────────────────────────────────────────────────────────
const ariaChat = async (message, context) => {
  const prompt = `You are ARIA (AI Response and Intelligence Assistant), the AI assistant for CivicMind's admin command center.

Current city statistics:
${JSON.stringify(context, null, 2)}

Admin query: "${message}"

Respond concisely, data-driven, and actionable. Use bullet points when helpful. End with one proactive recommendation. Keep response under 200 words.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return "I'm unable to process that request right now. Please check your Gemini API key configuration.";
  }
};

const getDefaultPredictions = () => [
  { issue: 'Pothole Surge', category: 'road', probability: 82, affectedAreas: ['MG Road', 'Zone 3'], reasoning: 'High rainfall + heavy traffic history', preventiveAction: 'Pre-deploy PWD teams' },
  { issue: 'Garbage Overflow', category: 'garbage', probability: 71, affectedAreas: ['Market Area', 'Residential Zone 5'], reasoning: 'Weekend pattern + festival season', preventiveAction: 'Increase collection frequency' },
  { issue: 'Water Shortage', category: 'water', probability: 65, affectedAreas: ['South District'], reasoning: 'Maintenance schedule + summer peak', preventiveAction: 'Schedule alternate supply routes' },
  { issue: 'Street Light Failures', category: 'electricity', probability: 48, affectedAreas: ['Old City', 'Highway NH8'], reasoning: 'Aging infrastructure trend', preventiveAction: 'Preventive maintenance sweep' },
  { issue: 'Traffic Congestion', category: 'traffic', probability: 44, affectedAreas: ['City Center', 'School Zone'], reasoning: 'Events + school reopening pattern', preventiveAction: 'Deploy additional traffic officers' },
];

module.exports = { analyzeComplaint, predictIssues, ariaChat };
