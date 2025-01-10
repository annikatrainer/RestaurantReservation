import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
 // redacted but contained database connection        
})
 

// maybe hardcode the 1 for active, so it does not need to be passed in
  let activateRestaurant = (name, active) => {
      return new Promise((resolve, reject) => { // wrap the query in a promise
            pool.query("UPDATE tables4U.Restaurants SET active=? WHERE name=?", [active, name], (error, rows) => { // query the DB
                if (error) { return reject(error); } // reject the promise if there's an error
                if ((rows) && (rows.affectedRows == 1)) {  // if the query was successful
                  console.log("Successfully updated restaurant:", name); 
                  return resolve(true);  
                } else {
                  console.log("Restaurant not found or not updated:", name);

                    return resolve(false);
                }
            });
      });
  }

  let response
  



  //make it return the information from http stuff
  try {
    const result = await activateRestaurant(event.name,1) // call the function
    if (result) { 
      response = { statusCode: 200, result: { "success" : true }}
    } else {
      response = { statusCode: 400, error: "Restaurant does not exist" }
    }
  } catch (err) {
     response = { statusCode: 400, error: err }
  }
    
  pool.end()     // close DB connections

  return response;
}

