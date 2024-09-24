const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

const router = express.Router();

router.get('/search', authMiddleware, async (req, res)=>{
    const { query, location } = req.query;

    if(!query) {
        return res.status(400).json({message:'Search query is required'})
    }

    const options = {
        method: 'GET',
        url: 'https://jserach.p.rapidapi.com/search',
        params: {
            query : query || 'Software Developer',
            location : location || '',
            num_pages: page|| '1',
        },
        headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
    }
    try{
        const response = await axios.request(options);

        if(!response.data || response.data.length === 0) {
          return res.status(404).json({message:'No jobs found for the given search criteria'})
        }

        res.status(200).json(response.data);
    }   catch (error) {
        console.error('Error fetching job listing:', error.response ? error.response.data : error.message);

        res.status(500).json({
            message: 'Error fetching job listings',
            error: error.response?error.response.data:error.message,
    });
    }
});

module.exports = router;