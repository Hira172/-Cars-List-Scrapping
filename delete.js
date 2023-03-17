require("dotenv").config();   
const { Pool } = require('pg')

const client = new Pool ({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 30000,
  })
client.connect()
.then(() => {
    console.log('connected with postgres')
})
.catch((err) => console.error('connection error', err.stack))

let languages = ['fr','es','ru','de','it','gr','tr','ro','fi','se','no','pl']
for (let i=0;i<languages.length;i++){
    query = 'TRUNCATE '+languages[i]+';'
        client.query(query)
}

console.log("Done")