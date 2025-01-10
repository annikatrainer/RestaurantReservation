import mysql from 'mysql'

export const handler = async (event) => {

  // Lists active restaurants only for the consumer- active should be an entry condition 

  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
      user: "calcAdmin",
      password: "Sabaidee2035*",
      database: "tables4U"
  });

  let CountRestaurants = (restaurant_ID) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT COUNT(*) AS `num` FROM Tables4 WHERE restaurant_ID=?", [restaurant_ID], (error, value) => {
            if (error) { return reject(error); }
            // turns into array containing single value [ { num: 13 } ]
            let output = JSON.parse(JSON.stringify(value))
            
            // return first entry and grab its 'num' attribute
            return resolve(output[0].num);
        })
    })
  } 
  
  let ListActiveRestaurants = (restaurant_ID) => { //need to add date(?)
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM tables4U.Tables4 WHERE restaurant_ID=?", [restaurant_ID], (error, rows) => {
            if (error) { return reject(error); }
            return resolve(rows);
        })
    })
 }

 const numbers = await CountRestaurants(event.restaurant_ID)
 let response;
 if (numbers == 0) {
    response = {
     statusCode: 400,
     error: "There are no active restaurants!"
   }
 } else {

     // NOTE: what if fails?
     const all_restaurants = await ListActiveRestaurants(event.restaurant_ID)
     
     response = {
       statusCode: 200,
       result:all_restaurants
     }
   }
 
 pool.end()     // close DB connections

 return response;
}