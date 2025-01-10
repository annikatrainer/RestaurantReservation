import mysql from 'mysql'
export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      // redacted but contained database connection  
  })
const FindReservation = (confirmation_ID, email) => {
  return new Promise((resolve, reject) => {
    let numTables = [];
    pool.query(
      "SELECT * FROM tables4U.Reservations WHERE confirmation_ID=? AND email=?", [confirmation_ID, email],
      (error, rows) => {
        if (error) { return reject(error); }
        if (rows.length > 0) {
          numTables.push(rows);
        }
        return resolve(rows);
      }
    )
  })
}
  //const numbers = await CountRestaurants()
  let response;
     // NOTE: what if fails?
     const all_restaurants = await FindReservation(event.confirmation_ID, event.email)
     response = {
       statusCode: 200,
       result:all_restaurants
     }
 
 pool.end()     // close DB connections

 return response;
}







