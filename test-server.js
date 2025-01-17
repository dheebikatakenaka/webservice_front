const express = require('express');
const app = express();

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});