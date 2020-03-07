const osmosis = require('osmosis')
const RSS = require('rss')
const fs = require('fs').promises
require('dotenv').config()

const inputRSSURL = process.env.ULTRASTAR_ES_RSS_URL

const outputRSSFile = "songs.rss"

let feed = new RSS({
  title: 'Ultrastar ES songs',
  site_url: 'https://ultrastar-es.org',
  feed_url: inputRSSUrl,
  custom_elements: [
    'language',
    'year',
    'album',
    'type'
  ]})

osmosis.config('keep_data', true)
osmosis
.get('https://ultrastar-es.org/foro/ucp.php?mode=login')
.submit("#login", {
  username: process.env.ULTRASTAR_ES_USERNAME,
  password: process.env.ULTRASTAR_ES_PASSWORD
})
.get(inputRSSUrl)
.find('item')
.set({
  link: 'link',
  title: 'title',
  guid: 'guid',
  summary: 'description',
  enclosure: {
    url: 'enclosure @url',
    type: 'enclosure @type'
  }
})
.data((data) => {
  const split = data.title.split('#')
  data.description = data.title
  data.title = split[0].trim()
  data.custom_elements = [
    {language: split[1].trim()},
    {year: split[3].trim()},
    {album: split[5].trim()},
    {type: 'SINGLE'}
  ]

  if (split.length > 7) 
    data.custom_elements.type = split[7].trim()

  feed.item(data)
})
.done(() => {
  const xml = feed.xml({indent: true})
  return fs.writeFile(outputRSSFile, xml)
})
//.log(console.log)
.error(console.error)
//.debug(console.log)

