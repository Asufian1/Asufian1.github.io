require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/engines/davinci-codex/completions',
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).send("Error communicating with OpenAI API");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
