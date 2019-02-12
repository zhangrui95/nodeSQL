const bodyParser = require('body-parser')
const express = require('express')
const moment = require('moment')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const app = express()

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

app.use(cors())
app.use(bodyParser.json({limit: '1mb'}))

// setting path //
let root_path;
if (path.isAbsolute(__filename)) {
  console.log("=> development envirment")
  root_path = path.resolve(path.dirname(__filename))
} else {
  console.log("=> production envirment")
  root_path = path.join(process.execPath, '..')
}
const db_dir = path.join(root_path, 'databases')

const db_json = path.join(db_dir, 'db.json')
const adapter = new FileSync(db_json)
const db = low(adapter)

const icon_db_json = path.join(db_dir, 'icon.db.json')
const adapter_icon = new FileSync(icon_db_json)
const db_icon = low(adapter_icon)

console.log(root_path)
const config_json = path.join(root_path, '..', 'config.json')
console.log(config_json)
const adapter_config = new FileSync(config_json)
const cdb = low(adapter_config)

// check config //
// if (cdb.get('cfg_ip').value() === undefined) {
//   cdb.set('cfg_ip', '0.0.0.0').write()
// }

function getConfigSync(tag, db) {
  return new Promise((resolve, reject) => {
    let config = db.get(tag)
    resolve(config)
  });
}

function saveConfigSync(tag, config, db) {
  return new Promise((resolve, reject) => {
    db.set(tag, config).write()
    resolve(true)
  })
}

function getAllConfig() {
  return Promise.all([
    getConfigSync('system', db),
    getConfigSync('third', db),
    getConfigSync('update', db)
  ])
}

function getDateTime() {
  return moment().format('YYYY-MM-DD HH:MM:SS')
}

function getReqRemoteIp(req) {
  // return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.ip;
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

function print_msg(req, route) {
  console.log('['+getDateTime()+']' + ' ' +  getReqRemoteIp(req) + ' visit: ' + route)
}

// router //
app.get('/', function (req, res) {
  res.json({ info: 'SLK-API Server', code: 200 });
});

app.get('/api/config', function (req, res, next) {
  print_msg(req, '/api/config')
  getAllConfig().then((data) => {
    res.json({ 'system': data[0], 'third': data[1], 'update': data[2] })
  }).catch((err) => {
    console.log(err)
  })
})

app.get('/api/icon', function (req, res, next) {
  print_msg(req, '/api/icon')
  getConfigSync('icon', db_icon).then((data) => {
    res.json(data)
  })
})

app.post('/api/icon/save', function (req, res, next) {
  print_msg(req, '/api/icon/save')
  const config = req.body.config
  saveConfigSync('icon', config, db_icon).then((result) => {
    res.json({ "code": 0, "message": "success" })
  })
})

app.get('/api/config/system', function (req, res, next) {
  print_msg(req, '/api/config/system')
  getConfigSync('system', db).then((data) => {
    res.json(data)
  })
})

app.post('/api/config/system/save', function (req, res, next) {
  print_msg(req, '/api/config/system/save')
  const config = req.body.config
  saveConfigSync('system', config, db).then((result) => {
    res.json({ "code": 0, "message": "success" })
  })
})


app.get('/api/config/third', function (req, res, next) {
  print_msg(req, '/api/config/third')
  getConfigSync('third', db).then((data) => {
    res.json(data)
  })
})

app.post('/api/config/third/save', function (req, res, next) {
  print_msg(req, '/api/config/third/save')
  const config = req.body.config
  saveConfigSync('third', config, db).then((result) => {
    res.json({ "code": 0, "message": "success" })
  })
})

app.get('/api/own', function (req, res, next) {
  print_msg(req, '/api/own')
  getConfigSync('own', db).then((data) => {
    res.json(data)
  })
})

app.post('/api/own/save', function (req, res, next) {
  print_msg(req, '/api/own/save')
  const config = req.body.config
  saveConfigSync('own', config, db).then((result) => {
    res.json({ "code": 0, "message": "success" })
  })
})

// const cfg_ip = cdb.get('cfg_ip').value()
console.log(cdb.get('slk-api'))
const cfg_port = cdb.get('slk-api').value().port

app.listen(cfg_port, '0.0.0.0', function () {
  console.log('CORS-enabled web server listening on port ' + cfg_port)
})
