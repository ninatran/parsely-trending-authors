const base_url = "https://api.parsely.com/v2/";
const authentication_params = new URLSearchParams(config);

// Construct endpoint to get top 5 authors in the past 24 hours by social interactions
let search_params = {
    period_start: '24h',
    sort: 'social_interactions',
    limit: 5,
}
const top_authors_path = "analytics/authors";
const top_authors_endpoint = endpoint(top_authors_path, search_params);

// Fetch trending authors from API
fetch(top_authors_endpoint)
.then(response => response.json())
.then(response => { 
    // Extract author name and metrics from response
    let top_authors = [];
    response.data.forEach( element => { 
        top_authors.push({author: element.author, social_interactions: element.metrics.social_interactions})
    });
    // Generate endpoint for top article of each author
    search_params.sort = 'fb_referrals';
    search_params.limit = 1;
    const author_detail_path = (author) => "analytics/author/" + author.replace(/ /g,'%20') + "/detail";
    top_authors.forEach(element => {
        element.endpoint = endpoint(author_detail_path(element.author), search_params);
    })
    return top_authors;
 })
 .then(top_authors => {
    // Get top article from Facebook referrals for each author
    Promise.all([
        fetch(top_authors[0].endpoint),
        fetch(top_authors[1].endpoint),
        fetch(top_authors[2].endpoint),
        fetch(top_authors[3].endpoint),
        fetch(top_authors[4].endpoint),
    ]).then(response => {
        return Promise.all(response.map(response => response.json()));
    }).then(responses => {
        let top_articles = [];
        responses.forEach(response => top_articles.push(response.data.pop()));
        //Render
        display(top_articles, top_authors);
    })
    .catch(err => {console.error(err)});
 })
.catch(err => {console.error(err)})

// Displays data on HTML Page
function display(articleDetails, authorDetails){
    const container = document.querySelector('#results-container');
    for(let i = 0; i < articleDetails.length; i++){ 
        const content = `<section class="author-listing">
            <header>
                <h1>${i+1}. ${articleDetails[i].author}</h1>
                <h2 class="metrics">${authorDetails[i].social_interactions} SI</h2>
            </header>
            <article>
                <img src="${articleDetails[i].image_url}">
                <div class="article-info">
                    <h1><a href="${articleDetails[i].link}">${articleDetails[i].title}</a></h1>
                    <h2 class="metrics">${articleDetails[i].metrics.fb_referrals} referrals from Facebook</h2>
                </div>
            </article>
        </section>`;
        container.insertAdjacentHTML('beforeend', content);
    }
}

// Returns endpoint with search params and authentication
function endpoint(path, params){
    const search_params = new URLSearchParams(params);
    return base_url + path + '?' + search_params.toString() + '&' + authentication_params.toString();
}