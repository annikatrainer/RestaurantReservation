import mysql from 'mysql'
import { v4 as uuidv4 } from 'uuid';

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      // redacted but contained database connection  
  })

const editRestaurant = (name, address, description, start_time, end_time, closed_days, active, pin) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO Restaurants 
       (name, address, description, start_time, end_time, closed_days, active, pin) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       address = IF(active = 0, VALUES(address), address),
       description = IF(active = 0, VALUES(description), description), 
       start_time = IF(active = 0, VALUES(start_time), start_time), 
       end_time = IF(active = 0, VALUES(end_time), end_time), 
       closed_days = IF(active = 0, VALUES(closed_days), closed_days), 
       active = IF(active = 0, VALUES(active), active);`,
      [name, address, description, start_time, end_time, closed_days, active, pin],
      (error, rows) => {
        if (error) { return reject(error); }
                if ((rows) && (rows.affectedRows == 0)) {
                    return resolve(false);
                } else {
                    return resolve(true);
                }
      }
    )
  })
}

  //const numbers = await CountRestaurants()
  let response
  let uuidPin = String(uuidv4())
  try {
    if (event.active === 1) {
      throw new Error("Restaurant is active cannot edit fields");
    }
    const all_result = await editRestaurant(event.name, event.address, event.description, event.start_time, event.end_time, event.closed_days, event.active, uuidPin)
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
      response = { statusCode: 400, error: "Restaurant is active and cannot edit" }
    }
  } catch (err) {
     response = { statusCode: 400, error: err };
  }
  
  pool.end()     // close DB connections

  return response;
}

// if ((rows) && (rows.affectedRows == 0))

