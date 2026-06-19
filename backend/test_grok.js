const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY || 'YOUR_API_KEY'}`
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'user', content: 'Reply with only valid JSON: {"status":"ok"}' }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  })
});
const data = await res.json();
console.log("Status:", res.status, "Response:", data.choices?.[0]?.message?.content || JSON.stringify(data).slice(0,200));
process.exit(0);
