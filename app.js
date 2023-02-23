require("dotenv").config();   
var scrapping = require('./scrapping.js')
const fs = require('fs/promises');
const axios = require('axios');
const { Pool } = require('pg')
const Jimp = require('jimp');

async function loadImages(images, car_id, client){
    for (i=0;i<images.length && i<20;i++){
        img = images[i]
        // img =  Buffer.from(img.split(',')[1], 'base64');
        // var image = await Jimp.read(img)
        // font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
        // image = await image.print(font, 10, 10, 'solncar.com')
        // .quality(90)  
        // .getBufferAsync('image/jpeg')
        query = 'INSERT INTO images(car_id, image) VALUES ($1, $2);'
        // values = [car_id, "data:image/jpeg;base64," + image.toString('base64')]
        values = [car_id, img]
        client.query(query, values)
        .then((res) => console.log("Image added for", car_id))
        .catch((err) => console.error('Error executing query', err.stack))
    } 
}


async function loadData(table, data, car_id, client){
    query = `
    INSERT INTO `+table+`(
        car_id, bodytype, brand, doors, endofproduction, generation, model, modification, "powertrainArchitecture", seats, startofproduction, acceleration100, acceleration60, acceleration62, "fuelType", "fuelconsumptionCombined", "fuelconsumptionExtraurban", "fuelconsumptionUrban", maximumspeed, dragcoefficient, fronttrack, height, length, minimumturningcircle, "rearTrack", wheelbase, width, compressionratio, "cylinderBore", engineaspiration, enginedisplacement, engineoilcapacity, "fuelSystem", "modelEngine", numberofcylinders, numberofvalvespercylinder, positionofcylinders, power, torque, drivewheel, frontbrakes, frontsuspension, "numberofGears", powersteering, rearbrakes, rearsuspension, steeringtype, tiressize, wheelrimssize, fueltankcapacity, "kerbWeight", maxload, maxweight, hotcar, batterycapacity, electricrange, averageEnergyconsumptionWLTP, averageEnergyconsumption, electricmotorpowernumber1, enginelocationnumber1, electricmotorpowernumber2, enginelocationnumber2, systempower, systemtorque, frontoverhang, rearoverhang)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66);
    `
    values =[car_id,data['Bodytype'],data['Brand'],data['Doors'],data['Endofproduction'],data['Generation'],data['Model'],data['Modification(Engine)'],data['PowertrainArchitecture'],data['Seats'],data['Startofproduction'],data['Acceleration0-100km/h'],data['Acceleration0-60mph'],data['Acceleration0-62mph'],data['FuelType'],data['Fuelconsumption(economy)-combined'],data['Fuelconsumption(economy)-extraurban'],data['Fuelconsumption(economy)-urban'],data['Maximumspeed'],data['Dragcoefficient(Cd)'],data['Fronttrack'],data['Height'],data['Length'],data['Minimumturningcircle(turningdiameter)'],data['Rear(Back)track'],data['Wheelbase'],data['Width'],data['Compressionratio'],data['CylinderBore'],data['Engineaspiration'] ,data['Enginedisplacement'] ,data['Engineoilcapacity'] ,data['FuelSystem'] ,data['ModelEngine'] ,data['Numberofcylinders'] ,data['Numberofvalvespercylinder'] ,data['Positionofcylinders'] ,data['Power'] ,data['Torque'] ,data['Drivewheel'] ,data['Frontbrakes'] ,data['Frontsuspension'] ,data['NumberofGears(automatictransmission)'] ,data['Powersteering'] ,data['Rearbrakes'] ,data['Rearsuspension'] ,data['Steeringtype'] ,data['Tiressize'] ,data['Wheelrimssize'] ,data['Fueltankcapacity'] ,data['KerbWeight'] ,data['Maxload'],data['Maxweight'] ,"false", data['Batterycapacity'], data['All-electricrange(WLTP)'], data['AverageEnergyconsumption(WLTP)'], data['AverageEnergyconsumption'], data['Electricmotorpowernumber1'], data['Enginelocationnumber1'], data['Electricmotorpowernumber2'], data['Enginelocationnumber2'], data['Systempower'], data['Systemtorque'], data['Frontoverhang'], data['Rearoverhang']]
    await client.query(query, values)
    .catch((err) => console.error('Error executing query', err.stack))
}

async function processing(car_id, client){
    // car_id = "43733" // 21231, 44442
    console.log("Started for : ", car_id)
    var result = await scrapping(car_id)
    console.log("done scrapping: ", car_id)
    // var flag = false;
    // do{
        try{
            console.log("images :",result.images.length, "for car_id: ", car_id)
            await loadImages(result.images, car_id, client)
            // let languages = ['en','fr','es','ru','de','it','gr','tr','ro','fi','se','no','pl']
            // let languages = ['en']
            // for (let i=0;i<languages.length;i++){
            //     await loadData(languages[i], result[languages[i]], car_id, client)
            //     .then(()=>{
            //         // un comment
            //         // axios.get('http://127.0.0.1:5000/'+car_id)
            //         // .then(function (response) {
            //         //     console.log("By python: ",car_id, response.data);
            //         // })
            //         // .catch(err=>console.log(err.response))
            //     })
            // }
            console.log("Done with: ", car_id)
        }
        catch(err){
            console.error('connection error', err.stack)
            await new Promise(r => setTimeout(r, 120000));
            console.log("restarted")
            flag = true;
        }
    // }while(flag)
   
    
}

module.exports = processing