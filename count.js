require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ☁️ Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Helper: Build folder path based on input
function buildFolderPath(zone, supervisor, ward, date, category) {
    let path = `Zones/${zone}/${supervisor}/${ward}`;
    if (date) path += `/${date}`;
    if (category) path += `/${category}`;
    return path;
}

// ✅ GET /count?zone=Zone-1&supervisor=John&ward=WARD-1&date=2024-06-22&category=Drainage
app.get('/count', async (req, res) => {
    const { zone, supervisor, ward, date, category } = req.query;

    if (!zone || !supervisor || !ward) {
        return res.status(400).json({ error: 'zone, supervisor, and ward are required' });
    }

    try {
        const folderPath = buildFolderPath(zone, supervisor, ward, date, category);
        console.log('🔍 Fetching image count from folder:', folderPath);

        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folderPath,
            max_results: 500,
        });

        const count = result.resources.length;
        res.json({ count });
    } catch (error) {
        console.error('❌ Cloudinary count error:', error);
        res.status(500).json({ error: 'Failed to fetch photo count' });
    }
});

// 🚀 Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
