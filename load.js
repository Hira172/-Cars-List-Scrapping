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
  

var limit =500
var pool = new Pool(credentials)
query = `
select car_id from en 
order by car_id  desc
limit 1
`
pool.query(query, [])
.then(async (res)=>{
  console.log
  console.log("Started from: "+ res.rows[0].car_id)
  var start = parseInt(res.rows[0].car_id)
        for (i = start+1; i<=start+limit ;i++){
          try{
            await processing(i, pool)
          }
          catch(err){
            console.log(err)
            console.log('ignore error')
          }
        }
  // var start = parseInt(res.rows[0].car_id)
  // var end = parseInt(res.rows[res.rows.length-1].car_id)
  // for (counter = end; counter<=start ;counter++){
  //   console.log(counter)
  //   try{
  //     var temp = dataToScrapp.filter(dat=>{return parseInt(dat.car_id) === counter})
  //     if(temp.length>0)
  //       await processing(counter, pool)
  //   }
  //   catch(err){
  //     console.log(err)
  //     console.log('ignore error')
  //   }
  // }
      
  
})
.catch((err) => {
  console.error('Error executing query', err.stack)
})
.finally(async()=>{
  await pool.end()
  console.log("end")
})

