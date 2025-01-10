import mysql from 'mysql';
export const handler = async (event) => {

  var pool = mysql.createPool({
    host: "tables4udb.cvms8kiuo53g.us-east-1.rds.amazonaws.com",
    user: "calcAdmin",
    password: "Sabaidee2035*",
    database: "tables4U"
  });


  let SpecificRestaurant = (name) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM tables4U.Restaurants WHERE name=?", [name], (error, rows) => {
        if (error) { return reject(error); }
        return resolve(rows);
      });
    });
  };

  let ListTables = (restaurant_ID) => {
    return new Promise((resolve, reject) => {
      // Query to select all tables for a given restaurant ID
      pool.query("SELECT * FROM tables4U.Tables4 WHERE restaurant_ID=?", [restaurant_ID], (error, rows) => {
        if (error) { return reject(error); }

        // Resolve the promise with the result rows
        return resolve(rows);
      });
    });
  }


  let ListReservations = (restaurant_ID, date) => {
    return new Promise((resolve, reject) => {
      // Query to select all reservations for a given restaurant ID, date
      pool.query("SELECT * FROM tables4U.Reservations WHERE restaurant_ID_reser=? AND date=?", [restaurant_ID, date], (error, rows) => {
        if (error) { return reject(error); }
        // If rows are returned, add the count to numTables

        return resolve(rows);
      });
    });
  }





  try {

    const specificRestaurant = await SpecificRestaurant(event.name) // grab specifc restuarant based on name input
    // const restaurant_ID = specificRestaurant[0].restaurant_ID; // grab the restaurant ID from the specific restaurant
    const start_time = specificRestaurant[0].start_time; // grab the start time from the specific restaurant
         console.log("start time: ", start_time);
    const end_time = specificRestaurant[0].end_time; // grab the end time from the specific restaurant
    console.log("end time: ", end_time);


        
    // Get current date in YYYY-MM-DD format
    const date = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
    const [month, day, year] = date.split('/');
    const currentDate = `${year}-${month}-${day}`;
    console.log("Current Date: ",currentDate);


    const allTables = await ListTables(specificRestaurant[0].restaurant_ID) // fetch all tables for the restaurant
    const reservations = await ListReservations(specificRestaurant[0].restaurant_ID, event.date) // fetch all reservations for the restaurant

    // Create a map of reservations by table ID and time
    let reservationMap = []; // Initialize the reservation map
    reservations.forEach(reservation => {
      const time = reservation.time.split(':').slice(0, 2).join(':'); // Convert time to HH:MM format
      const table_ID = reservation.table_ID; // Get the table ID for the reservation

      if (!reservationMap[time]) {
        reservationMap[time] = {}; // Initialize the time slot if it doesn't exist
      }
      reservationMap[time][table_ID] = reservation.confirmation_ID; // Mark the table as reserved at the given time
      console.log("resevation map: ", reservationMap[time][table_ID]);
    });



    // Generate the availability matrix
    let availabilityMatrix = [];
    // Create the header row with table IDs
    let headers = [" "].concat(allTables.map(table => `table ${table.table_ID}`));
    availabilityMatrix.push(headers);

    let startHour = parseInt(start_time.split(':')[0]); // Get the starting hour of the restaurant
    let endHour = parseInt(end_time.split(':')[0]); // Get the ending hour of the restaurant

    // Loop through each hour from start to end
    for (let hour = startHour; hour <= endHour; hour++) {
      let row = [`${hour}:00`]; // Initialize the row with the current hour
      
      
      allTables.forEach(table => { // Loop through each table
        const table_ID = table.table_ID; // Get the table ID
        const time = `${hour}:00`; // Format the time as HH:00

        console.log(`checking time: ${time}, table:, ${table_ID}`);


        if ((reservationMap[time] != null) && reservationMap[time][table_ID] != undefined) {
          row.push(reservationMap[time][table_ID]); // If there's a reservation, mark it as reserved
          console.log("Reserved added to chart");

        } else {
          row.push("open"); // If there's no reservation, mark it as open
        }
      });
      availabilityMatrix.push(row); // Add the row to the availability matrix
    }

   // console.log(`checking time: ${fire}, table:, ${table_ID}`);

    pool.end(); // Close DB connections

    return {
      statusCode: 200,
      result: availabilityMatrix
    };
  } catch (error) {
    pool.end(); // Ensure DB connections are closed in case of error
    return {
      statusCode: 400,
      error: "Internal Server Error: " + error.message
    };
  }
};