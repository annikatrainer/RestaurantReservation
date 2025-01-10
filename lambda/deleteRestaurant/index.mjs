import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      // redacted but contained database connection          
  })
  
  let deleteRestaurant = (name) => {
      return new Promise((resolve, reject) => { // wrap the query in a promise
            pool.query("DELETE FROM Restaurants WHERE name=?", [name], (error, rows) => { // query the DB
                if (error) { return reject(error); } // reject the promise if there's an error
                if ((rows) && (rows.affectedRows == 1)) {  // if the query was successful
                    return resolve(true);  
                } else {
                    return resolve(false);
                }
            });
      });
  }

  let response
  
  try {
    const result = await deleteRestaurant(event.name) // call the function
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

