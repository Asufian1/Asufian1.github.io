// Import necessary modules
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Route to handle chatbot messages
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message content is required" });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }]
            })
        });

        const data = await response.json();
        const botMessage = data.choices[0].message.content;

        res.json({ response: botMessage });
    } catch (error) {
        console.error("Error fetching response from OpenAI:", error);
        res.status(500).json({ error: "Error fetching response from OpenAI" });
    }
});

// Test route to verify the server is working
app.get('/', (req, res) => {
    res.send("Server is up and running!");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
