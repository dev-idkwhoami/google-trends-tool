# google-trends-tool

This repo is supposed to be a simply demonstration and playground for getting data from google trends.

### Usage

Simply run `index.js` and it will fetch the trends data per region once for each hour of the given day.

In `raws/` you can find the raw data the api returned and in `trends/` you can find the restructured data of the request.

### TrendsData interface

This is the finished "tool" to be used in other projects. It defines a simply interface to store the response in and a function to fetch the data.
