const { Pool, Client } = require('pg')
const connectionString = 'postgresql://postgres:postgres@192.168.3.230:5432/slk-message'

const pool = new Pool({
  connectionString: connectionString,
})

//pool.query('SELECT * FROM "user"', (err, res) => {
//  console.log(res.rows[0])
//  pool.end()
//})

const query = {
  
  text: 'INSERT INTO "user"(idcard, socket_id) VALUES ($1, $2)',
  values: ['230125199903044032', 'zzzdflkwfejoi3']
}

pool.query(query)
  .then(res => {
    if (res.rowCount === 1) {
      console.log("insert data success")
    }
  })
  .catch(e => {
    console.log("insert data failed")
    console.error(e.stack)
  })

//pool.query('SELECT * FROM ofuser').then(res => {
//  console.log(res.rows[0])
//})
