# Charts On Hand

This tool lets reporters use Google Sheets to create responsive charts about campaign fundraising. After the intial setup, there's no coding involved, other than copying and pasting `<iframe>` embed HTML.

### Set up and use spreadsheet

The sheet called *charts* is for metadata for each chart: Each one gets a unique ID, a title, and a caption (for source/credit). The max_dollars column dictates the upper bound of the bar charts. If its value is "auto" or just left blank, the upper bound will be the largest dollar value that appears in the chart. Setting an upper bound manually can be handy if you have multiple charts on the same page and want them to use the same scale. The values in column E (the number of candidates assigned to this chart) and column F (the `<iframe>` embed code) are generated through formaulas.

| chart_id | title | caption | max_dollars | AUTO_candidate_count | AUTO_embed_code |
| --- | --- | ---| --- | --- | --- |
| my_first_chart | Chart Title | Washington City Paper | 5000 | `=countif(data!A:A,A2)` | `="<iframe id='chartsonhand_"&A2&"' src='chart.html#"&A2&"' style='width:100%; overflow:hidden; display:block; border:0; margin:0;'></iframe>"` |
| some_other_chart | Chart Title | Source: OCF | auto | `=countif(data!A:A,A3)` | `="<iframe id='chartsonhand_"&A3&"' src='chart.html#"&A3&"' style='width:100%; overflow:hidden; display:block; border:0; margin:0;'></iframe>"` |

The sheet called *data* is for the campaign fundraising data. Each row represents a single candidate in a single chart. Each row has a chart ID to match the candidate to a single chart in the *charts* sheet. Each row also has columns for the candidate's name, along with the amount of money raised, money spent, and cash on hand for that candidate.

| chart_id | candidate_name | raised | spent | on_hand |
| --- | --- | ---| --- | --- |
| my_first_chart | Candidate A | 2500 | 3000 | 800
| my_first_chart | Candidate B | 5000 | $5,000.00 | $5,000
| some_other_chart | Candidate A | 245 | 453.3 | 175
| some_other_chart | Candidate C | 800 | 850 | 328
| some_other_chart | Candidate D | 10000 | 8403 | 650

Values for raised, spent, and on_hand work regardless of commas, dollar signs, and decimals.

### Install

Charts On Hand depends on d3.js, Tabletop.js, and jQuery.

Upload the repository to your website. Replace `chart.html` in the *charts* sheet's AUTO_embed_code formula (column F) with your chart.html file's URL.

In your Google Sheet, click "File" and then "Publish to the web" to make the spreadsheet publicly accessible. This generates a URL for the spreadsheet. Find the `key` value in the URL. Add it to your config.js file, which needs to contain `var tabletop_key = '[your spreadsheet key value]';`.

This tool does not handle cross-domain iframes.

### Example

[Here](http://www.washingtoncitypaper.com/blogs/looselips/2016/03/11/charts-which-d-c-council-candidates-have-raised-the-most-money/)'s how it looks in action.

### License & Credits

See `LICENSE` for details.

Built by [Zach Rausnitz](https://github.com/rausnitz) for [Washington City Paper](https://github.com/washingtoncitypaper/)