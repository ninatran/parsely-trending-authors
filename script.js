const base_url = "https://api.parsely.com/v2/";
const authentication_params = new URLSearchParams(config);

// Construct endpoint to get top 5 authors in the past 24 hours by social interactions
const top_authors_params = {
    period_start: '24h',
    sort: 'social_interactions',
    limit: 5,
}
const top_authors_path = "analytics/authors";
const top_authors_endpoint = endpoint(top_authors_path, top_authors_params);

// Fetch trending authors from API
fetch(top_authors_endpoint)
.then(res => res.json())
.then(response => { 
    let top_five_authors = [];
    response.data.forEach( element => {
        top_five_authors.push({
            author: element.author,
            social_interactions: element.metrics.social_interactions
        });
    });
    const author_detail_path = (author) => "analytics/author/" + author.replace(/ /g,'%20') + "/detail";
    const author_detail_params = {
        period_start: '24h',
        sort: 'fb_referrals',
        limit: 1
    }

    top_five_authors.forEach(element => {
        element.endpoint = endpoint(author_detail_path(element.author), author_detail_params);
    })

    return top_five_authors;
 })
 .then((author_details) => {
    // Get top article from Facebook referrals for each author
    Promise.all([
        fetch(author_details[0].endpoint),
        fetch(author_details[1].endpoint),
        fetch(author_details[2].endpoint),
        fetch(author_details[3].endpoint),
        fetch(author_details[4].endpoint),
    ]).then((res) => {
        return Promise.all(res.map(response => response.json()));
    }).then(responses => {
        let top_articles = [];
        responses.forEach(response => top_articles.push(response.data.pop()));
        return top_articles; //array of objects each object is the top post from each author
    })
    .then( top_articles => {
        display(top_articles, author_details);
    })
    .catch(err => {console.error(err)});
 })
.catch(err => {console.error(err)})

// Populates HTML page with data from API
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