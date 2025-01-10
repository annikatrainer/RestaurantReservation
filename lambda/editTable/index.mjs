import mysql from 'mysql'
export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      // redacted but contained database connection  
  })
const CreateRestaurant = (num_seats, restaurant_ID, confirmation_ID, table_num, table_ID) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO Tables4 
       (num_seats, restaurant_ID, confirmation_ID, table_num, table_ID) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       num_seats = VALUES(num_seats), restaurant_ID = VALUES(restaurant_ID), 
       confirmation_ID = VALUES(confirmation_ID),
       table_num = VALUES(table_num);`,
      [num_seats, restaurant_ID, confirmation_ID, table_num, table_ID],
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
  try {
    const all_result = await CreateRestaurant(event.num_seats, event.restaurant_ID, event.confirmation_ID, event.table_num, event.table_ID)
    if (all_result) {
        response = {
        statusCode: 200,
        result: {
          "success" : true,
          "num_seats" : event.num_seats,
          "confimation_ID" : event.confirmation_ID,
          "restaurant_ID_table" : event.restaurant_ID,
          "table_num" : event.table_num,
          "table_ID" : event.table_ID
        }
      }
    } else {
      response = { statusCode: 400, error: "Same name as already created restaurant" }
    }
  } catch (err) {
     response = { statusCode: 400, error: err.message}
  }
  
  pool.end()     // close DB connections
  return response;
}







