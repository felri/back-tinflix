const db = require('./db.js')

const createMovieTvshow = async ({ obj }) => {
  const query = `INSERT INTO moviesandshows 
  (
    title,
    year,
    rated,
    released,
    runtime,
    genre,
    director,
    actors,
    plot,
    posterOmdb,
    ratingsArray,
    imdbRating,
    type,
    language,
    country,
    netflixId,
    posterNetflix,
    imdbId,
    available,
    countalert
  ) VALUES (
    $1, 
    $2, 
    $3, 
    $4, 
    $5, 
    $6, 
    $7, 
    $8, 
    $9, 
    $10, 
    $11, 
    $12, 
    $13, 
    $14, 
    $15, 
    $16, 
    $17, 
    $18, 
    $19,
    0
  )
  ON CONFLICT (imdbId) DO UPDATE 
  SET title = $1,
  year = $2,
  rated = $3,
  released = $4,
  runtime = $5,
  genre = $6,
  director = $7,
  actors = $8,
  plot = $9,
  posterOmdb =  $10,
  ratingsArray = $11,
  imdbRating = $12,
  type =  $13,
  language =  $14,
  country =  $15,
  netflixId =  $16,
  posterNetflix =  $17
  RETURNING * 
  `
  return await db.pool.query(query, [
    (obj.title ? obj.title : ''),
    (obj.year ? obj.year : ''),
    (obj.rated ? obj.rated : ''),
    (obj.released ? obj.released : ''),
    (obj.runtime ? obj.runtime : ''),
    (obj.genre ? obj.genre : ''),
    (obj.director ? obj.director : ''),
    (obj.actors ? obj.actors : ''),
    (obj.plot ? obj.plot : ''),
    (obj.posterOmdb ? obj.posterOmdb : ''),
    (obj.ratings ? obj.ratings : ''),
    (obj.imdbrating ? obj.imdbrating : 0),
    (obj.type ? obj.type : ''),
    (obj.language ? obj.language : ''),
    (obj.country ? obj.country : ''),
    (obj.netflixId ? obj.netflixId : ''),
    (obj.posterNetflix ? obj.posterNetflix : ''),
    (obj.imdbId ? obj.imdbId : ''),
    obj.available
  ])
}
const getShows = async (request, response) => {
  let results = {}
  if(request.params.type === 'all') results = await getAll()
  else if(request.params.type === 'movie') results = await getMovies()
  else if(request.params.type === 'series') const results = await getTvshows()
  if(results.rows) response.status(200).json(results.rows)
  else response.status(200).json({})
}

const getTvshows = async () => {
  const results = await db.pool.query(`SELECT * FROM moviesandshows WHERE available = 'true' AND type = 'series' ORDER BY RANDOM() LIMIT 10;`)
  return results
}

const getMovies = async () => {
  const results = await db.pool.query(`SELECT * FROM moviesandshows WHERE available = 'true' AND type = 'movie' ORDER BY RANDOM() LIMIT 10;`)
  return results
}

const getAll = async () => {
  const results = await db.pool.query(`SELECT * FROM moviesandshows WHERE available = 'true' ORDER BY RANDOM() LIMIT 10;`)
  return results
}

const setAvailableFalse = async ({id}) => {
  const query = `UPDATE moviesandshows SET available = 'false' WHERE ID = $1`
  await db.pool.query(query, [id])
  return
}

const setCountNumber = async ({id, count}) => {
  const query = `UPDATE moviesandshows SET countalert = $2 WHERE ID = $1`
  await db.pool.query(query, [id, parseInt(count) + 1])
  return
}

const setAlert = async (request, response) => {
  const query = 'SELECT * FROM moviesandshows WHERE ID = $1'
  const resp = await db.pool.query(query, [request.params.id])
  if(resp.rows && resp.rows.length > 0) {
    const count = resp.rows[0].countalert
    if(count >= 10) setAvailableFalse({id: request.params.id})
    else setCountNumber({id: request.params.id, count})
    response.status(200).json({})
  }
}


module.exports = {
  createMovieTvshow,
  getShows,
  setAlert
}