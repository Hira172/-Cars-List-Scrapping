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
  


var pool = new Pool(credentials)
query = `
select car_id from en 
        order by car_id  desc
        limit 1
`
pool.query(query)
.then(async (res)=>{
  res.status(200).send("Started from: "+ data.rows[0].car_id)
  var start = parseInt(data.rows[0].car_id)
  for (i = start+1; i<=start+1000 ;i++){
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
  print("Ending")
  await pool.end()
  print("end")
})

