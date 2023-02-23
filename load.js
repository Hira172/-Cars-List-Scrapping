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
  
offset = 0
var limit =500
var pool = new Pool(credentials)
query = `
select car_id from en
WHERE car_id not in (select car_id from images)
order by car_id desc
offset $2
limit $1
`
pool.query(query, [limit, offset])
.then(async (res)=>{
  var dataToScrapp = res.rows
  console.log("total results: ", res.rows.length)
  console.log("Started from: "+ res.rows[0].car_id)
  console.log("Ending at: "+ res.rows[res.rows.length-1].car_id)
  var start = parseInt(res.rows[0].car_id)
  var end = parseInt(res.rows[res.rows.length-1].car_id)
  for (counter = end; counter<=start ;counter++){
    console.log(counter)
    try{
      var temp = dataToScrapp.filter(dat=>{return parseInt(dat.car_id) === counter})
      if(temp.length>0)
        await processing(counter, pool)
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

