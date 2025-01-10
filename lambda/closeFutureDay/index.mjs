import mysql from "mysql";
import { exit } from "process";

export const handler = async (event) => {
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    // redacted but contained database connection  
  });

  // date format is 2008-08-22

  let closeFutureDay = (date, restaurant_ID_day) => {
    return new Promise((resolve, reject) => {
      // wrap the query in a promise
      pool.query(
        `INSERT INTO tables4U.Closed_Days 
                        (date, restaurant_ID_day) 
                        VALUES (?, ?) 
                        ON DUPLICATE KEY UPDATE 
                        date = VALUES(date), restaurant_ID_day = VALUES(restaurant_ID_day);`,
        [date, restaurant_ID_day],
        (error, rows) => {
          if (error) {
            console.error("Error executing query:", error);
            return reject(error);
          } // reject the promise if there's an error
          if (rows && rows.affectedRows == 1) {
            // if the query was successful
            console.log("Successfully added to the table:", date);
            return resolve(true);
          } else {
            console.log("Date was not added:", date);
            return resolve(false);
          }
        }
      );
    });
  };

  let checkIfDayClosed = (date, restaurant_ID_day) => {
    return new Promise((resolve, reject) => {
      // wrap the query in a promise
      pool.query(
        "SELECT * FROM tables4U.Closed_Days WHERE date=? AND restaurant_ID_day=?",
        [date, restaurant_ID_day],
        (error, rows) => {
          if (error) {
            console.error("Error executing query:", error);
            return reject(error);
          } // reject the promise if there's an error
          if (rows.length > 0) {
            // if the query was successful
            console.log("Day is already closed");
            return resolve(true);
          } else {
            console.log("Day is not closed");
            return resolve(false);
          }
        }
      );
    });
  };

  let response;

  try {
    let curr_time = Date.now();
    console.log("Time currently", curr_time);
    let event_date = new Date(event.date);
    console.log("res time", event_date.getTime());

    if (event_date.getTime() < curr_time) {
      console.log("You cannot close a day that has already passed");
      response = {
        statusCode: 400,
        error: "Inputted Date is before Current Day",
      };
      return response;
    } else {
      const isDayClosed = await checkIfDayClosed(
        event.date,
        event.restaurant_ID_day
      );
      if (isDayClosed) {
        console.log("Day is already closed");
        response = { statusCode: 400, error: "Day is already closed" };
        return response;
      } else {
        const result = await closeFutureDay(
          event.date,
          event.restaurant_ID_day
        ); // call the function
        if (result) {
          response = {
            statusCode: 200,
            result: {
              success: true,
              date: event.date,
              restaurant_ID_day: event.restaurant_ID_day,
            },
          };
        } else {
          response = { statusCode: 400, error: "Restaurant does not exist" };
        };
      }
    }
  } catch (err) {
    response = {
      statusCode: 400,
      error: "Restaurant does not exist or Date was inputted incorrectly",
    };
  }

  pool.end(); // close DB connections
  return response;

};

