import mysql from 'mysql'

export const handler = async (event) => {

  // Lists active restaurants only for the consumer- active should be an entry condition 

  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      // redacted but contained database connection  
  });

  let countTotalTablesAvailable = (restaurant_ID) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT COUNT(*) AS `num` FROM Tables4 WHERE restaurant_ID = ?;", [restaurant_ID], (error, value) => {
            if (error) { return reject(error); }
            // turns into array containing single value [ { num: 13 } ]
            let output = JSON.parse(JSON.stringify(value))
            
            // return first entry and grab its 'num' attribute
            console.log("tot tables out", output[0].num)
            return resolve(output[0].num);
        })
    })
  }

  let countTotalSeatsAvailable = (restaurant_ID) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT SUM(num_seats) AS 'seatsAvail' FROM Tables4 WHERE restaurant_ID = ?;", [restaurant_ID], (error, value) => {
            if (error) { return reject(error); }
            let output = JSON.parse(JSON.stringify(value)) //Check that this output is correct 
            return resolve(output[0].seatsAvail);
        })
    })
  }
  
  let countTotalTablesUsed = (restaurant_ID, start_date, end_date) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT COUNT(*) AS `num` FROM Reservations WHERE restaurant_ID_reser = ? AND date BETWEEN ? and ?;", [restaurant_ID, start_date, end_date], (error, value) => {
            if (error) { return reject(error); }
            // turns into array containing single value [ { num: 13 } ]
            let output = JSON.parse(JSON.stringify(value))
            
            // return first entry and grab its 'num' attribute
            return resolve(output[0].num);
        })
    })
  }

  let countTotalSeatsUsed = (restaurant_ID, start_date, end_date) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT SUM(num_guests) AS 'seatsUsed' FROM Reservations WHERE restaurant_ID_reser = ? AND date BETWEEN ? and ?;", [restaurant_ID, start_date, end_date], (error, value) => {
            if (error) { return reject(error); }
            let output = JSON.parse(JSON.stringify(value)) //check correct output again 
            return resolve(output[0].seatsUsed);
        })
    })
  }

  let calcDaysBetween = (start_date, end_date) => {
    let time_diff = end_date.getTime() - start_date.getTime();
    let days_between = Math.round(time_diff / (1000 * 3600 * 24));
    return (days_between)
  }

  let response; 
  try{
    let totalSeats = await countTotalSeatsAvailable(event.restaurant_ID)
    console.log("tot seats", totalSeats)
    let totalTables = await countTotalTablesAvailable(event.restaurant_ID)
    console.log("tot tab", totalTables)
    let usedSeats = await countTotalSeatsUsed(event.restaurant_ID, event.start_date, event.end_date)
    console.log("used seats", usedSeats)
    let usedTables = await countTotalTablesUsed(event.restaurant_ID, event.start_date, event.end_date)
    console.log("used tables", usedTables)
    if(totalSeats && totalTables && usedSeats && usedTables){

      let start_date = new Date(event.start_date)
      let end_date = new Date(event.end_date)

      let start_time = event.start_time
      let end_time = event.end_time

      let [start_hour, r_minutes, r_seconds] = start_time.split(":").map(Number);
      let [closing_hour, c_minutes, c_seconds] = end_time.split(":").map(Number);
      console.log("start", start_hour)
      console.log("end", closing_hour)

      let num_hours = closing_hour - start_hour; 

      let total_days = calcDaysBetween(start_date, end_date)

      let util_percentage = (usedSeats/(totalSeats * total_days * num_hours)) * 100
      let avail_percentage = 100 - ((usedTables/(totalTables * total_days * num_hours)) * 100) 
      
      response = {
        statusCode: 200,
        result:{
          "success": true, 
          "util_per": util_percentage, 
          "avail_per" : avail_percentage
        }
      }
    }
    else{
      response = {statusCode: 400, error: "Error getting table or seat information"}
    }
    
  }catch (err) {
    response = { statusCode: 400, error: err.message}
 }

  pool.end()     // close DB connections
  return response;
} 