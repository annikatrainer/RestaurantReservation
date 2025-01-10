import mysql from 'mysql'
//import { v4 as uuidv4 } from 'uuid';

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
      user: "calcAdmin",
      password: "Sabaidee2035*",
      database: "tables4U"
  })

const editSchedule = (pin, start_time, end_time) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO Restaurants 
       (pin, start_time, end_time) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE  
       start_time = IF(active = 0, VALUES(start_time), start_time), 
       end_time = IF(active = 0, VALUES(end_time), end_time);`,
      [pin, start_time, end_time],
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
  //let uuidPin = String(uuidv4())
  try {
    if (event.active === 1) {
      throw new Error("Restaurant is active cannot edit fields");
    }
    const all_result = await editSchedule(event.pin, event.start_time, event.end_time)
    if (all_result) {
        response = {
        statusCode: 200,
        result: {
          "success" : true,
          "pin" : event.pin,
          "start_time" : event.start_time,
          "end_time" : event.end_time,
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

