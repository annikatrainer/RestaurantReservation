import mysql from 'mysql'

export const handler = async (event) => {

  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
    user: "calcAdmin",
    password: "Sabaidee2035*",
    database: "tables4U"
  })

  // can only do this when the restaurant is active
  // date format is 2008-08-22

  // Delete row from Closed_Days table
  let openFutureDay = (date, restaurant_ID_day) => {
    // check if there is a restaurant with that ID

    return new Promise((resolve, reject) => { // wrap the query in a promise
      pool.query('DELETE from tables4U.Closed_Days WHERE Date=? AND Restaurant_ID_day=?', [date, restaurant_ID_day], (error, rows) => { // query the DB
        if (error) {
          console.error("Error executing query:", error);
          return reject(error);
        } // reject the promise if there's an error
        if ((rows) && (rows.affectedRows == 1)) {  // if the query was successful
          console.log("Successfully deleted" + " from the table", date);
          return resolve(true);
        } else {
          console.log("Date was not deleted:", date);

          return resolve(false);
        }
      });
    });
  }


  let response;


  try {


    let curr_time = Date.now()
    console.log("Time currently", curr_time)
    let event_date = new Date(event.date)
    console.log(" Future time", event_date.getTime() )

  

    if (event_date.getTime() < curr_time) {
      console.log("You cannot close a day that has already passed");
      response = {
        statusCode: 400,
        error: "Inputted Date is before Current Day",
      };
      return response;
    } else {
      const result = await openFutureDay(event.date, event.restaurant_ID_day) // call the function
      if (result) {
        response = {
          statusCode: 200,
          result: {
            "success": true
            , "date": event.date
            , "restaurant_ID_day": event.restaurant_ID_day
          }
        }
      } else {
        response = { statusCode: 400, error: "Restaurant does not exist or Date was inputted incorrectly" }
      }
    }
  } catch (err) {
    response = {
      statusCode: 400,

      error: "Incorrect Format",
    }
  }

  pool.end()     // close DB connections

  return response;
}

