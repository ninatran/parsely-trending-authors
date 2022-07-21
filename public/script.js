getAnalytics();

async function getAnalytics(){
    const response = await fetch('/analytics');
    const json = await response.json();
    display(json);
}

// Displays data on HTML Page
function display(articleDetails){
    const container = document.querySelector('#results-container');
    document.querySelector('#load-msg').style.display = 'none';
    for(let i = 0; i < articleDetails.length; i++){ 
        const content = `<section class="author-listing">
            <header>
                <h1>${i+1}. ${articleDetails[i].author}</h1>
                <h2 class="metrics">${articleDetails[i].social_interactions} SI</h2>
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