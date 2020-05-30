const express = require('express')
require('dotenv').config()
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express()
const queries = require('./db/queries')
const fetchInfo = require('./utils/fetchInfo')

const port = 3235

app.use(cors())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/getShows', queries.getShows)
app.get('/setAlert/:id', queries.setAlert)
// app.get('/tvshows', dbTvshows.getTvshows)
// app.delete('/tvshows/:id', dbTvshows.deleteTvshow)
// app.delete('/tvshows/all', dbTvshows.cleanDb)
// app.get('/populateDb', dbTvshows.populateDb)

app.listen(port, () => {
  // fetchInfo.fetchMoviesNetflix()
  console.log(`App running on port ${port}.`)
})



