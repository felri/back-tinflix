const express = require('express')
require('dotenv').config()
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express()
const queries = require('./db/queries')
const schedule = require('node-schedule')
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

app.listen(port, () => {
  schedule.scheduleJob('0 0 * * *',fetchInfo.fetchMoviesNetflix())
  console.log(`App running on port ${port}.`)
})



