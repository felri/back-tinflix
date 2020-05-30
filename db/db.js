const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.USERNAME_DB,
  host: process.env.HOST,
  database: process.env.DB,
  password: process.env.PASSWORD,
  port: 5432,
})

module.exports = {
  pool
}