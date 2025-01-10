import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
      user: "calcAdmin",
      password: "Sabaidee2035*",
      database: "tables4U"
  })

  const CreateReservation = (date, time, num_guests, email, restaurant_ID_reser, table_ID) => {
    return new Promise((resolve, reject) => {
      pool.query(
        `INSERT INTO Reservations 
        (date, time, num_guests, email, restaurant_ID_reser, table_ID) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [date, time, num_guests, email, restaurant_ID_reser, table_ID],
        (error, rows) => {
          if (error) { return reject(error); }
            if ((rows) && (rows.affectedRows == 1)) {
              return resolve(rows);
            } else {
                return resolve(false);
            }
        }
      )
    })
  }

  let calcHoursBetween = (res_time, closing_time) => {

    let [res_hour, r_minutes, r_seconds] = res_time.split(":").map(Number);
    let [closing_hour, c_minutes, c_seconds] = closing_time.split(":").map(Number);
   
    
    console.log("Res", res_hour)
    console.log("Closing", closing_hour)
    let hours_between = closing_hour - res_hour

    return (hours_between)
  }

  let findTableGuests = (table_ID) => {
    return new Promise((resolve, reject) => { //add error? 
       console.log("finding table")
      pool.query("SELECT num_seats FROM tables4U.Tables4 WHERE table_ID = ?;", [table_ID], (error, rows) => {
          if (error) { return reject(error); }
          let output = JSON.parse(JSON.stringify(rows)) //check correct output again 
          console.log("Output", output)
          return resolve(output[0].num_seats);
      })
      
  })
  }

  let response
  try {
  
    // Check if it's in the past
    
    let curr_time = Date.now()
    console.log("Time currently", curr_time)
    let event_date = new Date(event.date + "T" + event.time)
    console.log("res time", event_date.getTime() )
    // Check if num guests exceed num spots at the table 
    let table_seats = await findTableGuests(event.table_ID)
    // Check if it's an hour before closing time 
    let closing_time = event.closing_time
    let start_time = event.start_time

    if (calcHoursBetween(event.time, closing_time) <= 0){
      response = { statusCode: 400, error: "Reservation time is less than one hour from closing." }
    }
    
    if (calcHoursBetween(event.time, start_time) > 0){
      response = { statusCode: 400, error: "Reservation time is for a time before the restaurant ." }
    }

    else if (event.num_guests > table_seats){
      response = { statusCode: 400, error: "Table does not have enough seats for number of guests!" }

    } 

    else if(event.time < curr_time){
      console.log("time:", event_date.getTime())
      console.log("current:", curr_time)
      response = { statusCode: 400, error: "Reservation time is in the past!" }

    }

    else{
      const all_result = await CreateReservation(event.date, event.time, event.num_guests, event.email, event.restaurant_ID_reser, event.table_ID)
      if (all_result) {
          response = {
          statusCode: 200,
          result: {
            "success" : true,
            "date" : event.date,
            "time" : event.time,
            "num_guests" : event.num_guests,
            "email" : event.email,
            "restaurant_ID_reser" : event.restaurant_ID_reser,
            "table_ID" : event.table_ID, 
            "confirmation_ID" : all_result
          }
        }
      } 
    }

    
  } catch (err) {
     response = { statusCode: 400, error: err }
  }
  
  pool.end()     // close DB connections

  return response;
}



