import mysql from 'mysql'
export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
      user: "calcAdmin",
      password: "Sabaidee2035*",
      database: "tables4U"
  })
const CreateRestaurant = (table_ID) => {
  return new Promise((resolve, reject) => {
    pool.query(
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
    const all_result = await CreateRestaurant(event.table_ID)
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







