# parsely-trending-authors

## Description
Proof of concept for a module that leverages the [Parse.ly API](https://www.parse.ly/help/api) to display the **top five authors of the past 24 hours** based on interactions across social media platforms and **links to the top article from each author** as measured by referrals from Facebook.

## How to view results
Visit [https://parsely-trending-authors.glitch.me/](https://parsely-trending-authors.glitch.me/)

### To view results in your local environment
1. Clone the git repository to your local environment
2. Create an `.env` file containing your `API_KEY` and `SECRET`
3. Run `npm init`
4. Run `npm run start`
5. View at `localhost:3000`

*This module was created specifically for [nola.com](https://www.nola.com/) as part of an interview coding challenge, but should work for all Parse.ly subscribers. Provide the appropriate API key and secret in an `.env` file*

## Licence 
MIT License
