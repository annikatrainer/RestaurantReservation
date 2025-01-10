import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    // redacted but contained database connection  
  })
  
  let DeleteConstant = (table_num) => {
      return new Promise((resolve, reject) => {
            pool.query("DELETE FROM Tables4 WHERE table_num=?", [table_num], 
              (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.affectedRows == 1)) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
      });
  }

  let response
  
  try {
    const result = await DeleteConstant(event.table_num)
    if (result) {
      response = { statusCode: 200, result: { "success" : true }}
    } else {
      response = { statusCode: 400, error: "No such constant" }
    }
  } catch (err) {
     response = { statusCode: 400, error: err }
  }
    
  pool.end()     // close DB connections

  return response;
}

