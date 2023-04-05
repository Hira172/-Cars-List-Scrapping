const Jimp = require('jimp');
const { Pool } = require('pg');
require("dotenv").config();
const processing = require('./app.js'); 


const credentials  = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
}
  


async function resize(img) { // Function name is same as of file name
    // Reading Image
    if(img === null)
        return ""
    // console.log("resizing image")
    img =  Buffer.from(img.split(',')[1], 'base64');
    var image = await Jimp.read(img)
    image =  await image.resize(300,200, function(err){
        if(err)return ""
    })
    .quality(80)    
    .getBufferAsync('image/jpeg');
    // .write('resized.jpeg');
    return "data:image/jpeg;base64," +  image.toString('base64')
 }

 



async function loadImage(car_id, image){
    query = `
        UPDATE en
        SET image = $2
        WHERE car_id = $1;
    `
    values =[car_id, image]
    await pool.query(query, values)
    // .then(()=>{console.log("Updated ", car_id)})
    .catch((err) => console.error('Error executing query', err.stack))
}
offset =3000
limit  = 500

 var pool = new Pool(credentials)
 query = `
    select car_id, (select image from images i where i.car_id=o.car_id limit 1)  from en o
    where car_id>=$1  and image is null
    order by car_id  desc
    limit $2
 `
 pool.query(query,[offset, limit])
 .then(async (res)=>{
    // console.log(res.rows)
   console.log("Started from offset: ", offset, "limit: ", limit)
   res = res.rows
   for(var count__=0;count__<res.length;count__++){
        var r = res[count__] 
//    await Promise.all(res.map(async r=>{
        if(r.image !== null || r.image !== undefined || r.image!==''){
            console.log("started for ", r.car_id)
            var img = await resize(r.image)
            await loadImage(r.car_id, img)
        }
    }
//    }))
       
   
 })
 .catch((err) => {
   console.error('Error executing query', err.stack)
 })
 .finally(async()=>{
   console.log("End with limit: ", limit)
   await pool.end()
 })
 
 
//  module.exports = resize