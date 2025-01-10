import mysql from "mysql";

export const handler = async (event) => {
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    // redacted but contained database connection  
  });

  let deleteRestaurant = (name) => {
    return new Promise((resolve, reject) => {
      // wrap the query in a promise
      pool.query("DELETE FROM tables4U.Restaurants WHERE name=?", [name], (error, rows) => {
          // query the DB
          if (error) {
            return reject(error);
          } // reject the promise if there's an error
          if (rows && rows.affectedRows == 1) {
            // if the query was successful
            return resolve(true);
          } else {
            return resolve(false);
          }
        }
      );
    });
  };




  // maybe needs the admin credentials, pin of the restaurant, and name of the restaurant
  let FindPin = (pin) => {
    return new Promise((resolve, reject) => {
      // wrap the query in a promise
      pool.query("SELECT * FROM tables4U.Restaurants WHERE pin=?",[pin], async (error, rows) => {
          if (error) {
            console.log("Error finding pin:", error);
            return reject(error)} // reject the promise if there's an error
          if (rows != null && rows.length == 1) {
            console.log("Successfully found row", rows[0].pin);
            // if the query was successful
            resolve(rows[0]);
          } else {
            console.log("Pin not found or multiple rows returned:", pin);
            resolve(null);
          }
        }
      );
    });
  };

  let response;


    //make it return the information from http stuff

  try {
    console.log("Event received:", event.name);
    //const restaurant = await FindPin(event.pin);
   // console.log("Successfully found restaurant with pin:", restaurant);

      if (event.pin === "1234") {
        console.log("Admin login successful: ", event.pin);
        const result = await deleteRestaurant(event.name); // call the function
        if (result) {
          response = { statusCode: 200, result: { success: true } };
        } else {
          response = { statusCode: 400, error: "Restaurant does not exist" };
        }
      } else {
        response = { statusCode: 400, error: "Invalid Admin Pin "};
      }
     
  } catch (err) {
    response = { statusCode: 400, error: err };
  }

  pool.end(); // close DB connections

  return response;
};

