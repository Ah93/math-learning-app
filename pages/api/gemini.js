// pages/api/gemini.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAUgrPIOR1Kokk1f29rvxhkIZom9mToA_o',
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gemini API call failed' });
  }
}