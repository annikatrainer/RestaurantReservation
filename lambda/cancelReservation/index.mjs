import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    // redacted but contained database connection          
  })
  
  let cancelReservation = (confirmation_ID) => {
      return new Promise((resolve, reject) => { // wrap the query in a promise
            pool.query("DELETE FROM tables4U.Reservations WHERE confirmation_ID = ?;", [confirmation_ID], (error, rows) => { // query the DB
                if (error) { return reject(error); } // reject the promise if there's an error
                if ((rows) && (rows.affectedRows == 1)) {  // if the query was successful
                    return resolve(true);  
                } else {
                    return resolve(false);
                }
            });
      });
  }

  let findReservationTime = (confirmation_ID) => { //need to add date(?)
    return new Promise((resolve, reject) => { //add error? 
       
        pool.query("SELECT date FROM tables4U.Reservations WHERE confirmation_ID = ?;", [confirmation_ID], (error, rows) => {
            if (error) { return reject(error); }
            let output = JSON.parse(JSON.stringify(rows)) //check correct output again 
            console.log("Output", output)
            return resolve(output[0].date);
        })
        
    })
 }

  let calcDaysBetween = (start_date, time) => {
    console.log("got here", start_date.getTime())
    console.log("curr time", time)
    let time_diff = start_date.getTime() - time;  
    console.log("Time difference", time_diff)
    let days_between = Math.round(time_diff / (1000 * 3600 * 24));
    console.log("Days between", days_between)
    return (days_between)
  }
  
  let response; 
  
  try {
    let date =  await findReservationTime(event.confirmation_ID) 
    if(date){
      console.log("Date", date)
      let theDate = new Date(date)
      let days_between = calcDaysBetween(theDate, Date.now())

      if(days_between <= 0){
        response = { statusCode: 400, error: "It's too late to cancel the reservation" }
      }

      else{
        const result = await cancelReservation(event.confirmation_ID) // call the function
        if (result) { 
          response = { statusCode: 200, result: { "success" : true }}
        } else {
          response = { statusCode: 400, error: "Reservation does not exist" }
        }
      }
    
    }
    else{
      response = { statusCode: 400, error: "Reservation does not exist" }
    }
    
  } catch (err) {
     response = { statusCode: 400, error: err }
  }
    
  pool.end()     // close DB connections

  return response;
}

