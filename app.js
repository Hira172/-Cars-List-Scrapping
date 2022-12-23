require("dotenv").config();   
var scrapping = require('./scrapping.js')
const fs = require('fs/promises');
const { Pool } = require('pg')

function loadImages(images, car_id, client){
    images.map(img=>{
        query = 'INSERT INTO images(car_id, image) VALUES ($1, $2);'
        values = [car_id, img]
        client.query(query, values)
        // .then((res) => console.log(res))
        .catch((err) => console.error('Error executing query', err.stack))
    })
}


function loadData(table, data, car_id, client){
    query = `
    INSERT INTO `+table+`(
        car_id, bodytype, brand, doors, endofproduction, generation, model, modification, "powertrainArchitecture", seats, startofproduction, acceleration100, acceleration60, acceleration62, "fuelType", "fuelconsumptionCombined", "fuelconsumptionExtraurban", "fuelconsumptionUrban", maximumspeed, dragcoefficient, fronttrack, height, length, minimumturningcircle, "rearTrack", wheelbase, width, compressionratio, "cylinderBore", engineaspiration, enginedisplacement, engineoilcapacity, "fuelSystem", "modelEngine", numberofcylinders, numberofvalvespercylinder, positionofcylinders, power, torque, drivewheel, frontbrakes, frontsuspension, "numberofGears", powersteering, rearbrakes, rearsuspension, steeringtype, tiressize, wheelrimssize, fueltankcapacity, "kerbWeight", maxload, maxweight, hotcar, batterycapacity, electricrange, averageEnergyconsumptionWLTP, averageEnergyconsumption, electricmotorpowernumber1, enginelocationnumber1, electricmotorpowernumber2, enginelocationnumber2, systempower, systemtorque, frontoverhang, rearoverhang)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66);
    `
    values =[car_id,data['Bodytype'],data['Brand'],data['Doors'],data['Endofproduction'],data['Generation'],data['Model'],data['Modification(Engine)'],data['PowertrainArchitecture'],data['Seats'],data['Startofproduction'],data['Acceleration0-100km/h'],data['Acceleration0-60mph'],data['Acceleration0-62mph'],data['FuelType'],data['Fuelconsumption(economy)-combined'],data['Fuelconsumption(economy)-extraurban'],data['Fuelconsumption(economy)-urban'],data['Maximumspeed'],data['Dragcoefficient(Cd)'],data['Fronttrack'],data['Height'],data['Length'],data['Minimumturningcircle(turningdiameter)'],data['Rear(Back)track'],data['Wheelbase'],data['Width'],data['Compressionratio'],data['CylinderBore'],data['Engineaspiration'] ,data['Enginedisplacement'] ,data['Engineoilcapacity'] ,data['FuelSystem'] ,data['ModelEngine'] ,data['Numberofcylinders'] ,data['Numberofvalvespercylinder'] ,data['Positionofcylinders'] ,data['Power'] ,data['Torque'] ,data['Drivewheel'] ,data['Frontbrakes'] ,data['Frontsuspension'] ,data['NumberofGears(automatictransmission)'] ,data['Powersteering'] ,data['Rearbrakes'] ,data['Rearsuspension'] ,data['Steeringtype'] ,data['Tiressize'] ,data['Wheelrimssize'] ,data['Fueltankcapacity'] ,data['KerbWeight'] ,data['Maxload'],data['Maxweight'] ,"false", data['Batterycapacity'], data['All-electricrange(WLTP)'], data['AverageEnergyconsumption(WLTP)'], data['AverageEnergyconsumption'], data['Electricmotorpowernumber1'], data['Enginelocationnumber1'], data['Electricmotorpowernumber2'], data['Enginelocationnumber2'], data['Systempower'], data['Systemtorque'], data['Frontoverhang'], data['Rearoverhang']]
    client.query(query, values)
        .catch((err) => console.error('Error executing query', err.stack))
}

async function processing(car_id){
    // car_id = "43733" // 21231, 44442
    console.log("Started for : ", car_id)
    var result = await scrapping(car_id)
    console.log("done scrapping: ", car_id)
    const client = new Pool ({
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        max: 200,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 30000,
      })
    client.connect()
    .then(() => console.log('connected with postgres'))
    .catch((err) => console.error('connection error', err.stack))
    // console.log(result['en'])
    loadImages(result.images, car_id, client)
    let languages = ['en','fr','es','ru','de','it','gr','tr','ro','fi','se','no','pl']
    for (let i=0;i<languages.length;i++){
        loadData(languages[i], result[languages[i]], car_id, client)
    }
    console.log("Done with: ", car_id)
}

module.exports = processing