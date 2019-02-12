const { Pool, Client } = require('pg')
const connectionString = 'postgresql://postgres:postgres@192.168.3.230:5432/slk-message'
const uuidv4 = require('uuid/v4');

const pool = new Pool({
  connectionString: connectionString,
})

function upsert_user_sid(idcard, socket_id, device, callback) {

  let query;
  if (device === "pc") {
    query = {
      text: 'INSERT INTO "user" (idcard, socket_id, pc_online) \
            VALUES ( $1, $2, $3 ) ON CONFLICT (idcard) DO \
            UPDATE \
              SET socket_id = EXCLUDED.socket_id, pc_online = 1;',
      values: [idcard, socket_id, 1]
    }
  } else {
    query = {
      text: 'INSERT INTO "user" (idcard, socket_id_mobile, mobile_online) \
            VALUES ( $1, $2, $3 ) ON CONFLICT (idcard) DO \
            UPDATE \
              SET socket_id_mobile = EXCLUDED.socket_id_mobile, mobile_online = 1;',
      values: [idcard, socket_id, 1]
    }
  }


  pool.query(query)
  .then(res => {
    if (res.rowCount === 1) {
      callback(null, { message: "upsert socketid success" })
    }
  })
  .catch(e => {
    callback(e.stack, { message: "upsert socketid failed" })
  })
}

function user_disconnect(idcard, device, callback) {

  let query = { text: '' }
  if ( device === 'pc' ) {
    query.text = 'UPDATE "user" SET pc_online = 0, socket_id = \'\' WHERE idcard = \'' + idcard + '\';'
  } else {
    query.text = 'UPDATE "user" SET mobile_online = 0, socket_id_mobile = \'\' WHERE idcard = \'' + idcard + '\';'
  }

  pool.query(query)
  .then(res => {
    if (res.rowCount === 1) {
      callback(null, { message: "setting " + device + " offline success" })
    }
  })
  .catch(e => {
    callback(e.stack, { message: "setting " + device + " offline failed" })
  })
}


function insert_pub_message(jdoc, callback) {

  const jdoc_with_uuid4 = {
    "uuid": uuidv4(),
    ...jdoc
  }
  const query = {
    text: 'INSERT INTO "message"(jdoc) VALUES ($1)',
    values: [jdoc_with_uuid4]
  }

  pool.query(query)
    .then(res => {
      if (res.rowCount === 1) {
        callback(null, { message: "insert pub data success" })
      }
    })
    .catch(e => {
      callback(e.stack, { message: "insert pub data failed" })
    })
}

function insert_pub_message_multi(message, callback) {

  let text_arg = []
  for (let i = 0; i<message.length; i++) {
      let num = i + 1
      text_arg.push("($"+ num +")")
  }
  const text_string = text_arg.join(',');

  let values = []
  message.map((jdoc) => {
    values.push({
      "uuid": uuidv4(),
      ...jdoc
    })
  })

  const query = {
    text: 'INSERT INTO "message"(jdoc) VALUES ' + text_string,
    values: values
  }

  pool.query(query)
    .then(res => {
      if (res.rowCount === message.length) {
        callback(null, { message: "insert pub data success" })
      }
    })
    .catch(e => {
      callback(e.stack, { message: "insert pub data failed" })
    })
}

function query_msg(query) {
  return new Promise((resolve, reject) => {
    pool.query(query)
      .then(res => {
        let rows = []
        res.rows.map((item) => {
          rows.push(item.jdoc)
        })
        resolve(rows)
      })
      .catch(e => {
        reject(e.stack)
      })
  })
}

function query_msg_count(query_count) {
  return new Promise((resolve, reject) => {
    pool.query(query_count)
      .then(res => {
        const total = parseInt(res.rows[0].count)
        resolve(total)
      })
      .catch(e => {
        reject(e.stack)
      })
  })
}

function query_data(query, query_count) {
  return Promise.all([
    query_msg(query),
    query_msg_count(query_count)
  ])
}

function query_pub_message(params, callback) {

  const idcard = params.idcard
  const size = params.size > 0 ? params.size : 5
  const page = params.page >= 0 ? params.page : 0
  const timeStart = params.timeStart ? params.timeStart : ""
  const timeEnd = params.timeEnd ? params.timeEnd : ""
  const contain = params.contain ? params.contain : ""
  const systemid = params.systemId ? params.systemId : ""
  const messageStatus = params.messageStatus ? params.messageStatus : []

  // SELECT jdoc->'nodeid' as receicer, jdoc->'time' as time, jdoc as docs FROM message WHERE jdoc @> '{"nodeid": "111111111111111111"}' AND (jdoc->>'time')::timestamp < '2019-01-01 12:12:12'::timestamp AND (jdoc->>'time')::timestamp > '2016-01-01 12:12:12'::timestamp LIMIT 5 offset 0;

  let sql_string = ''
  let total_string = ''
  let contain_filter = ''
  let systemId_filter = ''
  let time_filter = ''
  let messageStatus_filter = ''

  if (contain) {
    contain_filter = 'AND jdoc::text LIKE \'%' + contain + '%\''
  }
  if (systemid) {
    systemId_filter = 'AND jdoc @> \'{"systemid": "' + systemid + '"}\''
  }
  if (timeStart && timeEnd) {
    time_filter = 'AND (jdoc->>\'time\')::timestamp > \'' + timeStart + '\'::timestamp \
                   AND (jdoc->>\'time\')::timestamp < \'' + timeEnd + '\'::timestamp'
  }
  if (messageStatus.length > 0) {

    const ms_array = messageStatus.map((item) => {
        return "'" + item + "'"
    })
    const ms_string = ms_array.join(',')
    messageStatus_filter = 'AND jdoc->\'xxzt\'->>\'msg\' IN (' + ms_string + ')'
  }

  sql_string = 'SELECT * FROM message \
         WHERE jdoc @> \'{"nodeid": "' + idcard + '"}\' \
         ' + contain_filter + ' \
         ' + systemId_filter + ' \
         ' + time_filter + ' \
         ' + messageStatus_filter + ' \
         ORDER BY (jdoc->>\'time\')::timestamp desc \
         LIMIT ' + size + ' offset ' + page * size + ';'

  total_string = 'SELECT count(1) FROM message \
         WHERE jdoc @> \'{"nodeid": "' + idcard + '"}\' \
         ' + contain_filter + ' \
         ' + systemId_filter + ' \
         ' + time_filter + ' \
         ' + messageStatus_filter + ';'

  console.log(sql_string)

  const query = { text: sql_string }
  const query_count = { text: total_string }
  console.log("---------------------")
  console.log(total_string)

  query_data(query, query_count).then((data) => {
    callback(null, { message: "query pub data success", data: { total: data[1], data: data[0]} })
  }).catch((err) => {
    callback(err, { message: "query pub data failed", data: [] })
  })

  //pool.query(query)
  //  .then(res => {

  //    let rows = []
  //    res.rows.map((item) => {
  //      rows.push(item.jdoc)
  //    })

  //    // 查询总数量
  //    pool.query(query_count)
  //      .then(res => {
  //        const total = parseInt(res.rows[0].count)
  //        callback(null, { message: "query pub data success", data: { total: total, data: rows } })
  //      })
  //      .catch(e => {
  //        callback(e.stack, { message: "query pub data failed", data: [] })
  //      })

  //  })
  //  .catch(e => {
  //    callback(e.stack, { message: "query pub data failed", data: [] })
  //  })
}

function update_message_read(uuid, device, callback) {

  let sql_string = '';
  if (device === 'pc') {
    sql_string = "UPDATE message SET jdoc=jsonb_set(jdoc, '{read}', '1'::jsonb) WHERE (jdoc ->> 'uuid') = '" + uuid + "'"
  } else {
    sql_string = "UPDATE message SET jdoc=jsonb_set(jdoc, '{read_m}', '1'::jsonb) WHERE (jdoc ->> 'uuid') = '" + uuid + "'"
  }

  let query = {
    text: sql_string
  }

  pool.query(query)
  .then(res => {
    if (res.rowCount === 1) {
      callback(null, { result: "success" })
    }
  })
  .catch(e => {
    callback(e.stack, { result: "failed" })
  })
}

exports.upsert_user_sid = upsert_user_sid;
exports.user_disconnect = user_disconnect;
exports.insert_pub_message = insert_pub_message;
exports.query_pub_message = query_pub_message;
exports.update_message_read = update_message_read;
exports.insert_pub_message_multi = insert_pub_message_multi;




