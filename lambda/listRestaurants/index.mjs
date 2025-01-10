import mysql from 'mysql'

export const handler = async (event) => {

  // Lists active + inactive restaurants for the admin

  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
      user: "calcAdmin",
      password: "Sabaidee2035*",
      database: "tables4U"
  });

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
  
  let ListRestaurants = () => { //need to add date(?)
    return new Promise((resolve, reject) => { //add error? 
       
        pool.query("SELECT * FROM tables4U.Restaurants", [], (error, rows) => {
            if (error) { return reject(error); }
            return resolve(rows);
        })
        
    })
 }

 const numbers = await CountRestaurants()
 let response;
 if (numbers == 0) {
    response = {
     statusCode: 400,
     error: "No restaurants have been created."
   }
 } else {

     // NOTE: what if fails?
     const all_restaurants = await ListRestaurants()
     
     response = {
       statusCode: 200,
       result:all_restaurants
     }
   }
 
 pool.end()     // close DB connections

 return response;
}