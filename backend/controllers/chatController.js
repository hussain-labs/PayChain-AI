import axios from 'axios';

export const handleChat = async (req, res) => {
  try {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Grok API key is not configured on the server." });
    }

    const { messages, model, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model || 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: temperature || 0.3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Chat Controller Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error?.message || "Failed to communicate with AI service" 
    });
  }
};
