import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      // redacted but contained database connection  
  });
  
  let FindPin = (pin_input) => {
        return new Promise((resolve, reject) => {
            if(pin_input == "1234"){ //this should also change at some point 
                return resolve({"pin": pin_input, "role" : "admin"}) 
            }
            else{
                pool.query("SELECT * FROM tables4U.Restaurants WHERE pin=?",
                    [pin_input], (error, rows) => {
                    if (error) { return reject(error) }
                    if ((rows) && (rows.length == 1)) {
                        return resolve({"pin": rows[0].pin, "role" : "manager"})
                    } else {
                        return reject("Unable to locate user pin '" + pin_input + "'")
                    }
                }); 
            }
            
        });
  }
  
  const results = await FindPin(event.pin)

  pool.end()

  return { 
    statusCode: 200,
    result : {
        "pin" : JSON.stringify(results.pin),
        "role" : JSON.stringify(results.role)
    } 
  }
}