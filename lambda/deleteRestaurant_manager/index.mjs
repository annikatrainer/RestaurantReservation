import mysql from "mysql";

export const handler = async (event) => {
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
    user: "calcAdmin",
    password: "Sabaidee2035*",
    database: "tables4U",
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
    const restaurant = await FindPin(event.pin);
    console.log("Successfully found restaurant with pin:", restaurant);

    if (restaurant != null) {
      if (restaurant.name === event.name) {
        console.log("Restaurant name matches the pin:", restaurant.name);
        const result = await deleteRestaurant(event.name); // call the function
        if (result) {
          response = { statusCode: 200, result: { success: true } };
        } else {
          response = { statusCode: 400, error: "Restaurant does not exist" };
        }
      } else {
        response = {
          statusCode: 400,
          error: "pin does not match restuarant name",
        };
      }
    } else {
      console.log("Invalid pin:", event.pin);
      response = { statusCode: 400, error: "Invalid pin" };
    }
  } catch (err) {
    response = { statusCode: 400, error: err };
  }

  pool.end(); // close DB connections

  return response;
};

