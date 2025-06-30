// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Contract addresses - Sepolia Testnet
const CONTRACT_ADDRESSES = {
    sepolia: {
        savingsVault: "0xfbf31DE014f0cCbD04A1f18A3576E2459c97484a",
        lottery: "0xe423a22c2f308623163F2E589D8dac499DF8aF08"
    },
    local: {
        savingsVault: "0x0000000000000000000000000000000000000000",
        lottery: "0x0000000000000000000000000000000000000000"
    }
};

// API endpoint to serve contract addresses
app.get('/api/contract-addresses', (req, res) => {
    try {
        res.json(CONTRACT_ADDRESSES);
    } catch (error) {
        console.error('Error serving contract addresses:', error);
        res.status(500).json({ error: 'Failed to load contract addresses' });
    }
});

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and navigate to the URL above`);
    console.log(`🔗 Make sure MetaMask is connected to Sepolia testnet`);
    console.log(`🎮 Demo mode is enabled - no blockchain connection required`);
    console.log(`📋 Contract addresses will be loaded from environment variables`);
}); 