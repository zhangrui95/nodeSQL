const { Pool, Client } = require('pg')
const moment = require('moment')
const connectionString = 'postgresql://postgres:postgres@192.168.3.230:5432/slk-message'

const pool = new Pool({
  connectionString: connectionString,
})

const fs = require('fs')


function insert_data() {

  json_data = fs.readFileSync('test/pubdata.json', 'utf-8')
  a = JSON.parse(json_data)[0]
  a.nodeid = "333333333333333333"
  a.time = moment().format('YYYY-MM-DD hh:mm:ss');
  jd = JSON.stringify(a)

  const query = {
    text: 'INSERT INTO "message"(jdoc) VALUES ($1)',
    values: [jd]
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
}

//for ( let i = 0; i < 100000; i++ ) {
//  insert_data()
//}
insert_data()
