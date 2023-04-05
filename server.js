const express = require("express");
let bodyParser = require('body-parser');
const cors = require("cors");
const { Pool } = require('pg')
require("dotenv").config();
const processing = require('./app'); 



const app = express();

app.use(cors({
    origin: '*'
  }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());



const PORT = 8080;


app.use(function (err, req, res, next) {
    console.error(err.message, req);
    if (!err.statusCode)
      err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
  });
  


const credentials  = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
}
  

app.get("/scrapping", (req, res, next) => { 
    var pool = new Pool(credentials)
    var limit = 1000
    query = `
        select car_id from en 
        order by car_id  desc
        limit 1
    `
    pool.query(query)
    .then(async (data) => {
      var start;
      if(data.rows !== undefined || data.rows !== null || data.rows.length>0){
        res.status(200).send("Started from: "+ data.rows[0].car_id)
         start = parseInt(data.rows[0].car_id)+1
      }else{
        res.status(200).send("Started from: 0")
         start = 0
      }
        for (counter_ = start+1; counter_<=start+limit ;counter_++){
          try{
            await processing(counter_, pool)
          }
          catch(err){
            console.log(err)
            console.log('ignore error')
          }
        }
    })
    .catch((err) => next(err.stack))
    .finally(()=>{
      pool.end();
    })
  });

app.get("/", (req, res) => { 
  res.status(200).send("Welcome to backend of Cars Listing project"); 
});


app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));