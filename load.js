const { Pool } = require('pg');
require("dotenv").config();
const processing = require('./app.js'); 


const credentials  = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    // idleTimeoutMillis: 60000,
    // connectionTimeoutMillis: 30000,
}
  

var limit =50
var pool = new Pool(credentials)
query = `
select car_id from en
WHERE car_id not in (select car_id from images)
order by car_id desc
limit $1
`
pool.query(query, [limit])
.then(async (res)=>{
  console.log("total results: ", res.rows.length)
  console.log("Started from: "+ res.rows[0].car_id)
  console.log("Ending at: "+ res.rows[res.rows.length-1].car_id)
  var start = parseInt(res.rows[0].car_id)
  // var start = res.rows[0].car_id
  var end = parseInt(res.rows[res.rows.length-1].car_id)
  for (i = start; i>=end ;i--){
    try{
         await processing(i, pool)
    }
    catch(err){
      console.log(err)
      console.log('ignore error')
    }
  }
      
  
})
.catch((err) => {
  console.error('Error executing query', err.stack)
})
.finally(async()=>{
  console.log("Ending")
  await pool.end()
  console.log("end")
})

