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



const PORT = process.env.PORT || 8080;


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
    database: process.env.PGDATABASE,
    max: 40
}
  

app.get("/scrapping", (req, res, next) => { 
    var pool = new Pool(credentials)
    var limit = 10
    query = `
        select car_id from en 
        order by car_id  desc
        limit 1
    `
    pool.query(query)
    .then(async (data) => {
        res.status(200).send("Started from: "+ data.rows[0].car_id)
        var start = parseInt(data.rows[0].car_id)
        for (i = start+1; i<=start+limit ;i++){
            await processing(i)
        }
    })
    .catch((err) => next(err.stack))
    pool.end();
  });

app.get("/", (req, res) => { 
  res.status(200).send("Welcome to backend of Cars Listing project"); 
});


app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));