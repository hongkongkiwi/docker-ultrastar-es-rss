const osmosis = require('osmosis')
const RSS = require('rss')
const fs = require('fs').promises
require('dotenv').config()
const program = require('commander')
program.version(require('./package').version)

program
  .name(require('./package').name)
  .usage("[options] <output_file.rss>")
  .option('-d, --debug', 'output extra debugging', false)
  .requiredOption('-u, --username <value>', 'ultrastar-es.org username', process.env.ULTRASTAR_ES_USERNAME)
  .requiredOption('-p, --password <value>', 'ultrastar-es.org password', process.env.ULTRASTAR_ES_PASSWORD)
  .requiredOption('-r, --rss-feed <value>', 'ultrastar-es.org rss feed url', process.env.ULTRASTAR_ES_RSS_URL)

program.parse(process.argv)

if (program.args.length == 0 || program.args[0].length == 0) {
  program.help((text) => {
    return "ERROR: Must pass an output_file.rss name\n\n" + text
  })
}

if (program.debug) {
  console.log('Program Inputs')
  console.log(program.opts());
}

const inputRSSUrl = program.opts().rssFeed
const outputRSSFile = program.args[0]

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
  username: program.opts().username,
  password: program.opts().password
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
.log((log) => {
  if (program.opts().debug)
    console.log(log)
})
.error(console.error)
.debug((log) => {
  if (program.opts().debug)
    console.log(log)
})

