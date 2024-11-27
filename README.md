# atlas-the-joy-of-painting-api

## Installation

After cloning the repo, use MySQL to run the setup.sql script, and then run `node extract.js` - this will take a minute as it extracts the contents of all the CSVs and inserts them into the database created by setup.sql.

## Usage

currently, request query parameters are the best way of hitting the API, for example:
<br/>
`localhost:5000/?month=August&color=Alizarin Crimson&subject=Mountain` will return a list of JSONs of all episodes that originally aired in August, include Alizarin Crimson in their color palette, and feature a mountain.
<br/>
Available query parameters are:
<br/>
`month` - search by the month the episode originally aired.
<br/>
`color` - search for episodes that include a specific color in their color palette.
<br/>
`subject` - search for episodes that include a specific theme.