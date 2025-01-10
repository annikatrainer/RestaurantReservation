import { all } from 'axios';
import mysql from 'mysql';
export const handler = async (event) => {
  // Lists active restaurants only for the consumer - active should be an entry condition
  // Get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
    user: "calcAdmin",
    password: "Sabaidee2035*",
    database: "tables4U"
  });
  // let CountRestaurants = () => {
  //   return new Promise((resolve, reject) => {
  //     pool.query("SELECT COUNT(*) AS `num` FROM Restaurants;", [], (error, value) => {
  //       if (error) { return reject(error); }
  //       // Turns into array containing single value [ { num: 13 } ]
  //       let output = JSON.parse(JSON.stringify(value));
  //       // Return first entry and grab its 'num' attribute
  //       return resolve(output[0].num);
  //     });
  //   });
  // };

  let SpecificRestaurant = (name) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM tables4U.Restaurants WHERE name=?", [name], (error, rows) => {
        if (error) { return reject(error); }
        return resolve(rows);
      });
    });
  };
  let ListActiveRestaurants = (restaurants) => {
    return new Promise((resolve, reject) => {
      let openRestaurants = [];
      let queries = restaurants.map((rest) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM tables4U.Restaurants WHERE active=?", [true], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length >  0) {
              openRestaurants.push(rest);
            }
            return resolve(rows);
          });
        });
      });
      Promise.all(queries)
        .then(() => resolve(openRestaurants))
        .catch((error) => reject(error));
    });
  };
  // let ListActiveRestaurants = () => {
  //   return new Promise((resolve, reject) => {
  //     pool.query("SELECT * FROM tables4U.Restaurants WHERE active=?", [true], (error, rows) => {
  //       if (error) { return reject(error); }
  //       return resolve(rows);
  //     });
  //   });
  // };
  let ListOpenRestaurants = (restaurants, date) => {
    return new Promise((resolve, reject) => {
      let openRestaurants = [];
      let queries = restaurants.map((rest) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM tables4U.Closed_Days WHERE restaurant_ID_day=? AND date=?", [rest.restaurant_ID, date], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length === 0) {
              openRestaurants.push(rest);
            }
            return resolve(rows);
          });
        });
      });
      Promise.all(queries)
        .then(() => resolve(openRestaurants))
        .catch((error) => reject(error));
    });
  };
  let ListOpenTime = (restaurants, time) => {
    return new Promise((resolve, reject) => {
      let openRestaurants = [];
      let queries = restaurants.map((rest) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM tables4U.Restaurants WHERE restaurant_ID=? AND ? BETWEEN start_time AND end_time", [rest.restaurant_ID, time], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length > 0) {
              openRestaurants.push(rest);
            } else {
              resolve(null)
            }
            return resolve(rows);
          });
        });
      });
      Promise.all(queries)
        .then(() => resolve(openRestaurants))
        .catch((error) => reject(error));
    });
  };


  let ListTables = (restaurants) => {
    return new Promise((resolve, reject) => {
      let numTables = [];
      let queries = restaurants.map((rest) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM tables4U.Tables4 WHERE restaurant_ID=?", [rest.restaurant_ID], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length > 0) {
              numTables.push(rows.length);
            } else {
              resolve(null)
            }
            return resolve(rows);
          });
        });
      });
      Promise.all(queries)
        .then(() => resolve(numTables))
        .catch((error) => reject(error));
    });
  };
  let ListReservations = (restaurants, date, time) => {
    return new Promise((resolve, reject) => {
      let numTables = [];
      let queries = restaurants.map((rest) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM tables4U.Reservations WHERE restaurant_ID_reser=? AND date=? AND time=?", [rest.restaurant_ID, date, time], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length > 0) {
              numTables.push(rows.length);
            } else {
              numTables.push(0)
            }
            return resolve(rows); 
          });
        });
      });
  
      Promise.all(queries)
        .then(() => resolve(numTables))
        .catch((error) => reject(error));
    });
  };
  let ListAllTables = (restaurants) => {
    return new Promise((resolve, reject) => {
      let numTables = [];
      let queries = restaurants.map((rest) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT tables4U.Tables4.table_ID, tables4U.Tables4.restaurant_ID FROM tables4U.Tables4 WHERE restaurant_ID=?", [rest.restaurant_ID], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length > 0) {
              numTables.push(rows);
            }
            return resolve(rows); 
          });
        });
      });
  
      Promise.all(queries)
        .then(() => resolve(numTables))
        .catch((error) => reject(error));
    });
  };
  let ListAllReservations = (restaurants, date) => {
    return new Promise((resolve, reject) => {
      let numTables = [];
      let queries = restaurants.map((rest) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM tables4U.Reservations WHERE restaurant_ID_reser=? AND date =?", [rest.restaurant_ID, date], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length > 0) {
              numTables.push(rows);
            }
            return resolve(rows); 
          });
        });
      });
  
      Promise.all(queries)
        .then(() => resolve(numTables))
        .catch((error) => reject(error));
    });
  };
  let CleanTables = (date, restaurant_ID) => {
    let numTables = [];
    return new Promise((resolve, reject) => {
      pool.query("SELECT tables4U.Tables4.table_ID, tables4U.Tables4.restaurant_ID FROM tables4U.Tables4 INNER JOIN tables4U.Reservations ON tables4U.Tables4.table_ID = tables4U.Reservations.table_ID WHERE tables4U.Reservations.date = ? AND tables4U.Reservations.restaurant_ID_reser = ?",
         [date,restaurant_ID], (error, rows) => {
        if (error) { return reject(error); }
        if (rows.length === 0) {
          numTables.push(rows);
        }
        return resolve(rows);
      });
    });
  };
  let ClearRestaurants = (tables) => {
    return new Promise((resolve, reject) => {
      let numTables = [];
      let queries = tables.map((table) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT tables4U.Tables4.restaurant_ID FROM tables4U.Tables4 WHERE table_ID=?", [table], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length > 0) {
              numTables.push(rows);
            }
            return resolve(rows); 
          });
        });
      });
  
      Promise.all(queries)
        .then(() => resolve(numTables))
        .catch((error) => reject(error));
    });
  };
  let FinalRestaurants = (restaurants) => {
    return new Promise((resolve, reject) => {
      let numTables = [];
      let queries = restaurants.map((restaurant) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM tables4U.Restaurants WHERE restaurant_ID=?", [restaurant], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length > 0) {
              numTables.push(rows);
            }
            return resolve(rows); 
          });
        });
      });
  
      Promise.all(queries)
        .then(() => resolve(numTables))
        .catch((error) => reject(error));
    });
  };
  let FinalTables = (tables) => {
    return new Promise((resolve, reject) => {
      let numTables = [];
      let queries = tables.map((table) => {
        return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM tables4U.Tables4 WHERE table_ID=?", [table], (error, rows) => {
            if (error) { return reject(error); }
            if (rows.length > 0) {
              numTables.push(rows);
            }
            return resolve(rows); 
          });
        });
      });
  
      Promise.all(queries)
        .then(() => resolve(numTables))
        .catch((error) => reject(error));
    });
  };
  let calcHoursBetween = (res_time, closing_time) => {
    let [res_hour, r_minutes, r_seconds] = res_time.split(":").map(Number);
    let [closing_hour, c_minutes, c_seconds] = closing_time.split(":").map(Number);
    console.log("Res", res_hour)
    console.log("Closing", closing_hour)
    let hours_between = closing_hour - res_hour
    return (hours_between)
  }
  // let CorrectRestaurants = (cleanedTables, allTables) => {
  //   return new Promise((resolve, reject) => {
  //     let numTables = [];
  //     let queries = cleanedTables.map((cTable) => {
  //       let queries = allTables.map((aTable) =>{
  //         return new Promise((resolve, reject) => {
  //           pool.query("SELECT * FROM tables4U.Tables4 WHERE restaurant_ID=?", [cTable.table_ID, aTable.table_ID], (error, rows) => {
  //             if (error) { return reject(error); }
  //             if (rows.length > 0) {
  //               numTables.push(rows);
  //             }
  //             return resolve(rows); 
  //           });
  //         });
  //       })
  //     });
  
  //     Promise.all(queries)
  //       .then(() => resolve(numTables))
  //       .catch((error) => reject(error));
  //   });
  // };
//   SELECT *
// FROM employee
// NATURAL JOIN department;
  
  //     Promise.all(queries)
  //       .then((results) => {
  //         // Filter out the null values (restaurants that don't match the time)
  //         let openRestaurants = results.filter(rest => rest !== null);
  //         resolve(openRestaurants);
  //       })
  //       .catch((error) => reject(error));
  //   });
  // };
  // let ListOpenRestaurants = (restaurant, date) => {
  //       return new Promise((resolve, reject) => {
  //         pool.query("SELECT * FROM tables4U.Closed_Days WHERE restaurant_ID_day=? AND date=? ", [restaurant, date], (error, rows) => {
  //           if (error) { return reject(error); }
  //           return resolve(rows);
  //         });
  //       });
  // };
  try {
    //const numbers = await CountRestaurants();
    const heep = false
    let response;
    if (heep) {
      response = {
        statusCode: 400,
        error: "There are no available restaurants!"
      };
    } else {
      const specificRestaurant = await SpecificRestaurant(event.name)
      const allRestaurants = await ListActiveRestaurants(specificRestaurant); //works
      const startTime = allRestaurants[0].start_time;
      const endTime = allRestaurants[0].end_time;
      const hours = await calcHoursBetween(startTime, endTime)

      const specificID = specificRestaurant.flatMap(restaurant => restaurant.restaurant_ID)

      let openRestaurants = await ListOpenRestaurants(allRestaurants, event.date); //works

      const allReservations = await ListAllReservations(openRestaurants, event.date)
      const allTables = await ListAllTables (openRestaurants) // works
      const cleanedTables = await CleanTables (event.date, specificID) // change it to just be event.date
     // const correctRestaurants = await CorrectRestaurants(cleanedTables, allTables)
      const cleanTableIDs = cleanedTables.flatMap(table => table.table_ID);
      const allTableIDs = allTables.flatMap(restaurant => restaurant.map(table => table.table_ID));
      let tables2 = [];
      for (let i = 0; i < cleanTableIDs.length; i++){
        for (let j = 0; j < allTableIDs.length; j++){
          if (cleanTableIDs[i] === allTableIDs[j]){
            tables2.push(cleanTableIDs[i])
          }
        }
      }
      let tables3 = [];
      let tableSet = new Set(tables2);
      for (let j = 0; j < allTableIDs.length; j++) {
        if (!tableSet.has(allTableIDs[j])) {
          tables3.push(allTableIDs[j]);
          tableSet.add(allTableIDs[j]); 
        }
      }
      const clearRestaurants = await ClearRestaurants (tables3)
      const clearRests = clearRestaurants.flatMap(restaurant => restaurant.map(restaurant => restaurant.restaurant_ID));
      let tables4 = [];
      let restaurantSet = new Set();
      for (let i = 0; i < clearRests.length; i++) {
        if (!restaurantSet.has(clearRests[i])) {
          tables4.push(clearRests[i]);
          restaurantSet.add(clearRests[i]);
        }
      }
      const allTablesList = allTables.flatMap(restaurant => restaurant.map(table => table.table_ID))
      const allReservationList = allReservations.flatMap(restaurant => restaurant.map(reservation => reservation.confirmation_ID))
      let printer = 0
      const jello = allTablesList.length * hours
      if (jello <= allReservationList.length){
        openRestaurants = null
      }
      // const allReserLength = allReservations[0].length
      // const allTableLength = allTables[0].length
      const finalRestaurants = await FinalRestaurants(tables4)
      const finalTables = await FinalTables(tables3)
      // const allTableTimes = allTableLength*hours
      response = {
        statusCode: 200,
        result: openRestaurants
      };
    }
    pool.end(); // Close DB connections
    return response;
  } catch (error) {
    pool.end(); // Ensure DB connections are closed in case of error
    return {
      statusCode: 500,
      error: "Internal Server Error: " + error.message
    };
  }
};
     // grab the above list and delete them from the original list 
     // do the same for if it is open during that time 
     // grab list and delete from most recent list
     // then do if any tables don't have reservations
     // count the number of tables that that restaurant has 
      // go through the list of restaurants and attach a corresponding number to the restaurants in a seperate array representing the number of tables that restaurant has
     // count the number of reservations during that specific date and time that the restaurant has 
      // go through the list of restaurants and attach a corresponding number to the restaurants in a seperate array representing the number of reservations that restaurant has
     // if the numbers match then the restaurant is not availble
     // if the numbers do not match then the restaurant is availble
      // grab the object of the corresponding index in the restaurants list
      // grab the list of tables for each restaurant ))
      // go through and grab the reservations that match and compare with the reservations table_ID 
        // maybe do a double for loop with the restaurants and tables 
        // get the table_IDs 
      // could do if match table_ID in list then delete from list 
      // take the tables and create a list of the restaurants that are in the table's restaurant_ID
      // join or natural join just do the table_ID or left/ right join
      // join on when the time, date and table is the same
      // SELECT tables4U.Tables4.table_ID, tables4U.Reservations.table_ID FROM tables4U.Tables4 INNER JOIN tables4U.Reservations ON tables4U.Tables4.table_ID=tables4U.Reservations.table_ID
      // SELECT tables4U.Tables4.table_ID, tables4U.Reservations.table_ID FROM tables4U.Tables4 LEFT JOIN tables4U.Reservations ON tables4U.Tables4.table_ID=tables4U.Reservations.table_ID ORDER BY tables4U.tables4
//       SELECT * 
// FROM tables4U.Tables4 JOIN tables4U.Reservations 
// WHERE tables4U.Tables4.table_ID = tables4U.Reservations.table_ID
// SELECT tables4U.Tables4.table_ID
// FROM tables4U.Tables4 JOIN tables4U.Reservations 
// WHERE tables4U.Tables4.table_ID = tables4U.Reservations.table_ID AND
//    tables4U.Reservations.time = "00:00:13" AND tables4U.Reservations.date = "2008-08-08"
// grab the tables that have reservations and delete them from the all tables 
// could just do by table_IDs and then go back through and grab restaurants 