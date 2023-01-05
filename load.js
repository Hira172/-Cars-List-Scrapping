const { Pool } = require('pg')
require("dotenv").config();
const processing = require('./app.js'); 

notin = ['1774','27327','38171','1268', '5100', '18667', '22083', '22080', '28736', '18569', '18659', '24672']


const credentials  = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
}
  


var pool = new Pool(credentials)

query = `
SELECT all_ids AS id
FROM generate_series((SELECT MIN(car_id) FROM en), (SELECT MAX(car_id) FROM en)) all_ids
EXCEPT 
SELECT car_id FROM en
`
pool.query(query)
.then(async (res)=>{
  pool.end();
  rows = res.rows
  for (let row in rows){
    if(!notin.includes(rows[row].id))
      await processing(rows[row].id)
  }
})
.catch((err) => {
  console.error('Error executing query', err.stack)
  pool.end();
})
    

