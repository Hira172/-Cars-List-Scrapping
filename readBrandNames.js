require("dotenv").config();
const fs = require('fs');
const { Pool  } = require('pg')

let rawdata = fs.readFileSync('brands.txt');
let brands = JSON.parse(rawdata);
const client = new Pool ({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  })
client.connect()
.then(() => console.log('connected with postgres'))
.catch((err) => console.error('connection error', err))
brands.map(brand=>{
    query = 'INSERT INTO brands(name, logo) VALUES ($1, $2);'
    values = [brand.name, brand.logo]
    client.query(query, values)
    .then((res) => console.log(res))
    .catch((err) => console.error('Error executing query', err.stack))
})