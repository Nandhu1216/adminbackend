require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: build Cloudinary folder path based on params
function buildFolderPath(zone, supervisor, date, category) {
    let path = `Zones/${zone}/${supervisor}`;
    if (date) path += `/${date}`;
    if (category) path += `/${category}`;
    return path;
}

// GET /count?zone=Zone-1&supervisor=John&date=2023-06-21&category=CategoryA
app.get('/count', async (req, res) => {
    const { zone, supervisor, date, category } = req.query;

    if (!zone || !supervisor) {
        return res.status(400).json({ error: 'zone and supervisor are required' });
    }

    try {
        const folder = buildFolderPath(zone, supervisor, date, category);

        // Cloudinary API: list all resources in folder (pagination possible)
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: 500, // max per request; increase with pagination if needed
        });

        const count = result.resources.length;

        res.json({ count });
    } catch (error) {
        console.error('Cloudinary count error:', error);
        res.status(500).json({ error: 'Failed to fetch photo count' });
    }
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
