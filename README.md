# atlas-the-joy-of-painting-api

## Installation

After cloning the repo, use MySQL to run the setup.sql script, and then run `node extract.js` - this will take a minute as it extracts the contents of all the CSVs and inserts them into the database created by setup.sql.

## Usage

currently, request query parameters are the best way of hitting the API, for example:
`localhost:5000/?month=August&color=Alizarin Crimson&subject=Mountain` will return a list of JSONs of all episodes that originally aired in August, include Alizarin Crimson in their color palette, and feature a mountain.
Available query parameters are:
`month` - search by the month the episode originally aired.
`color` - search for episodes that include a specific color in their color palette.
`subject` - search for episodes that include a specific theme.