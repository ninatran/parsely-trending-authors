const express = require('express');
const fetch = require('node-fetch');
const { env } = require('process');
require('dotenv').config();

const app = express();

app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

app.get('/analytics', async (req, res) => {

    res.cookie('cookieName', 'cookieValue', { sameSite: 'none', secure: true});

    const base_url = "https://api.parsely.com/v2/";
    const config = {
        apikey: process.env.API_KEY,
        secret: process.env.SECRET
    }
    const authentication_params = new URLSearchParams(config);

    // Utility function to create endpoints
    function endpoint(path, params){
        const search_params = new URLSearchParams(params);
        return base_url + path + '?' + search_params.toString() + '&' + authentication_params.toString();
    }

    // Construct endpoint to get top 5 authors in the past 24 hours by social interactions
    let search_params = {
        period_start: '24h',
        sort: 'social_interactions',
        limit: 5,
    }

    const top_authors_path = "analytics/authors";
    const top_authors_endpoint = endpoint(top_authors_path, search_params);
    
    // Fetch top authors
    const top_authors_response = await fetch(top_authors_endpoint);
    const top_authors_json = await top_authors_response.json();

    // Extract author name and metrics from response
    let top_authors_list = [];
    top_authors_json.data.forEach( element => { 
        top_authors_list.push({author: element.author, social_interactions: element.metrics.social_interactions})
    });

    // Generate endpoint for top article of each author
    let fetch_endpoints = [];
    search_params.sort = 'fb_referrals';
    search_params.limit = 1;
    const author_detail_path = (author) => "analytics/author/" + author.replace(/ /g,'%20') + "/detail";
    top_authors_list.forEach(element => {
        element.endpoint = endpoint(author_detail_path(element.author), search_params);
        fetch_endpoints.push(fetch(element.endpoint));
    })

    // Fetch top article of each author
    let top_articles = [];

    const author_detail_resp = await Promise.all(fetch_endpoints);
    const author_detail_json = await Promise.all(author_detail_resp.map(response => response.json()));
    
    author_detail_json.forEach(response => top_articles.push(response.data.pop()));
    for(let i = 0; i < top_articles.length; i++){
        top_articles[i].social_interactions = top_authors_list[i].social_interactions;
    }

    res.json(top_articles);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {console.log("Server listening at " + port);})