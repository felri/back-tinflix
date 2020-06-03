const fetch = require("node-fetch");
const jsdom = require("jsdom");
const queries = require("../db/queries")

const PAGES_MOVIES = 100
const PAGES_TVSHOWS = 50

function returnHtmlDoc(resp) {
  const dom = new jsdom.JSDOM(resp);
  return dom.window.document
}

async function getTvShowOmdbId(id) {
  try {
    const response = await fetch(`${process.env.BASE_URL_OMDB}?i=${id}${process.env.API_KEY}`)
    const data = await response.json()
    if (data.Response === 'True') return data
    else return null
  } catch (e) {
    return null
  }
}

async function fetchMoviesNetflix() {
  console.log('GETTING NEW MOVIES')
  let movies = []
  for (let i = 0; i < PAGES_MOVIES; i++) {
    console.log(`---------- PAGINA MOVIES${i + 1} ---------------------`)
    const text = await fetch(`${process.env.BASE_URL_NETFLIX_MOVIES}${i + 1}`).then(res => res.text())
    const doc = returnHtmlDoc(text)
    const results = doc.getElementsByClassName('card card-plain mx-auto')
    const itemsPage = await getItemsFromPage(results)
    movies.concat(itemsPage)
  }
}

async function fetchTvshowsNetflix() {
  console.log('GETTING NEW SHOWS')
  let tvshows = []
  for (let i = 0; i < PAGES_TVSHOWS; i++) {
    console.log(`---------- PAGINA TV SHOWS${i + 1} ---------------------`)
    const text = await fetch(`${process.env.BASE_URL_NETFLIX_TVSHOWS}${i + 1}`).then(res => res.text())
    const doc = returnHtmlDoc(text)
    const results = doc.getElementsByClassName('card card-plain mx-auto')
    const itemsPage = await getItemsFromPage(results)
    tvshows.concat(itemsPage)
  }
}

function formatOmdbInfo(omdbInfo) {
  let info = {}
  if (omdbInfo.Year && omdbInfo.Year !== 'N/A') info.year = omdbInfo.Year
  if (omdbInfo.Rated && omdbInfo.Rated !== 'N/A') info.rated = omdbInfo.Rated
  if (omdbInfo.Released && omdbInfo.Released !== 'N/A') info.released = omdbInfo.Released
  if (omdbInfo.Runtime && omdbInfo.Runtime !== 'N/A') info.runtime = omdbInfo.Runtime
  if (omdbInfo.Genre && omdbInfo.Genre !== 'N/A') info.genre = omdbInfo.Genre
  if (omdbInfo.Director && omdbInfo.Director !== 'N/A') info.director = omdbInfo.Director
  if (omdbInfo.Actors && omdbInfo.Actors !== 'N/A') info.actors = omdbInfo.Actors
  if (omdbInfo.Plot && omdbInfo.Plot !== 'N/A') info.plot = omdbInfo.Plot
  if (omdbInfo.Poster && omdbInfo.Poster !== 'N/A') info.posterOmdb = omdbInfo.Poster
  if (omdbInfo.Ratings && omdbInfo.Ratings.length > 0) info.ratings = omdbInfo.Ratings
  if (omdbInfo.Type && omdbInfo.Type !== 'N/A') info.type = omdbInfo.Type
  if (omdbInfo.Language && omdbInfo.Language !== 'N/A') info.language = omdbInfo.Language
  if (omdbInfo.Country && omdbInfo.Country !== 'N/A') info.country = omdbInfo.Country
  if (omdbInfo.imdbRating && omdbInfo.imdbRating !== 'N/A') info.imdbrating = omdbInfo.imdbRating

  return info
}

async function getYoutubeTrailer({title}) {
  const url = process.env.BASE_URL_YOUTUBE + title + process.env.API_KEY_YOUTUBE
  try {
    const response = await fetch(url)
    const data = await response.json()
    if (data.items && data.items.length > 0) {
      for(let i = 0; i < data.items.length; i++) {
        if(data.items[i].id.videoId && data.items[i].snippet.title.toUpperCase().includes('TRAILER')) {
          return data.items[i].id.videoId
        }
      }
    } else return undefined
  } catch (e) {
    return undefined
  }
}

async function getItemsFromPage(items) {
  for (let i = 0; i < items.length; i++) {
    const REGEX_IMDB_ID = /title\/(.*)\/\?ref/gm;
    const REGEX_NETFLIX_ID = /title\/(.*)\//gm;
    const REGEX_IMAGE = /(.*)\?r/gm;

    const imdbId = items[i].querySelector('.imdbRatingPlugin a') && REGEX_IMDB_ID.exec(items[i].querySelector('.imdbRatingPlugin a').href)
    const netflixId = REGEX_NETFLIX_ID.exec(items[i].querySelector('.card-header-image a').href)
    const poster = REGEX_IMAGE.exec(items[i].querySelector('.poster').dataset.src)
    const title = items[i].querySelector('.card-title').textContent

    if (netflixId && poster && imdbId) {
      const trailer = await getYoutubeTrailer({title})
      let obj = {
        netflixId: netflixId[1],
        posterNetflix: poster[1],
        title: title,
        imdbId: imdbId && imdbId[1],
        available: true,
        trailer: trailer
      }

      if (imdbId) {
        let omdbInfo = await getTvShowOmdbId(imdbId[1])
        if (omdbInfo) {
          omdbInfo = formatOmdbInfo(omdbInfo)
          obj = { ...obj, ...omdbInfo }
        } else {
          console.log('--------ERRRO NO OMDB -----------------')
        }
        const responseDb = await queries.createMovieTvshow({ obj })
        console.log(responseDb.rows[0] && responseDb.rows[0].title)
      }
    }
  }
}

module.exports = {
  fetchTvshowsNetflix,
  fetchMoviesNetflix
}