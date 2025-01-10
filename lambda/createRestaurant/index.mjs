import mysql from 'mysql'
import { v4 as uuidv4 } from 'uuid';

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
      user: "calcAdmin",
      password: "Sabaidee2035*",
      database: "tables4U"
  })
  
  let CountRestaurants = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT COUNT(*) AS `num` FROM Restaurants;", [], (error, value) => {
            if (error) { return reject(error); }
            // turns into array containing single value [ { num: 13 } ]
            let output = JSON.parse(JSON.stringify(value))
            
            // return first entry and grab its 'num' attribute
            return resolve(output[0].num);
        })
    })
}

const CreateRestaurant = (name, address, description, start_time, end_time, closed_days, active, pin) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO Restaurants 
       (name, address, description, start_time, end_time, closed_days, active, pin) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       address = VALUES(address), description = VALUES(description), 
       start_time = VALUES(start_time), end_time = VALUES(end_time), 
       closed_days = VALUES(closed_days), active = VALUES(active), 
       pin = VALUES(pin);`,
      [name, address, description, start_time, end_time, closed_days, active, pin],
      (error, rows) => {
        if (error) { return reject(error); }
                if ((rows) && (rows.affectedRows == 1)) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
      }
    )
  })
}

  //const numbers = await CountRestaurants()
  let response
  let uuidPin = String(uuidv4())
  try {
    const all_result = await CreateRestaurant(event.name, event.address, event.description, event.start_time, event.end_time, event.closed_days, event.active, uuidPin)
    if (all_result) {
        response = {
        statusCode: 200,
        result: {
          "success" : true,
          "name" : event.name,
          "address" : event.address,
          "description" : event.description,
          "start_time" : event.start_time,
          "end_time" : event.end_time,
          "closed_days" : event.closed_days,
          "active" : event.active,
          "pin" : uuidPin
        }
      }
    } else {
      response = { statusCode: 400, error: "Same name as already created restaurant" }
    }
  } catch (err) {
     response = { statusCode: 400, error: err }
  }
  
  pool.end()     // close DB connections

  return response;
}



