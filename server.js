const bodyParser = require('body-parser');
const isJSON = require('is-json');//判断json
const bunyan = require('bunyan');//日志
const execa = require('execa');//启动子进程
const low = require('lowdb');//基于Node的纯Json文件数据库
const cors = require('cors');//解决跨域
const path = require('path');//模块用于处理文件与目录的路径
const Ajv = require("ajv");//json格式校验
const fs = require('fs');//Node.js文件操

const { upsert_user_sid, user_disconnect, insert_pub_message, insert_pub_message_multi, query_pub_message, update_message_read } = require('./pg-api')
const { Dictionary } = require('./common')
const { pubdata_schema } = require('./schema/pubdata.valid')

const ajv = new Ajv();
const validate = ajv.compile(pubdata_schema);

process.env.TZ = 'Asia/Shanghai'

// program path
let root_path;
if (path.isAbsolute(__filename)) {
  console.log("=> development envirment")
  root_path = path.resolve(path.dirname(__filename))
} else {
  console.log("=> production envirment")
  root_path = path.join(process.execPath, '..')
}
const log_dir = path.join(root_path, 'logs')

// config file
const FileSync = require('lowdb/adapters/FileSync')
const db_json = path.join(root_path, 'config.json')
const adapter = new FileSync(db_json)
const db = low(adapter)

//黑名单json
const black_db_json = path.join(root_path, 'blackList', 'blackList.db.json')
const adapter_black = new FileSync(black_db_json)
const db_black = low(adapter_black);
db_black.defaults({ list: [] }).write();
let blockList = db_black.get('list').value();
console.log('黑名单列表------->',blockList);

// init config
db.defaults({
  "slk-message": {
    "port": 8720
  },
  "slk-api": {
    "launch": true,
    "port": 8722
  },
  "slk-admin": {
    "launch": true,
    "port": 8724
  }
}).write()

// bind port
let port = db.get('slk-message').value().port
let slk_api_port = db.get('slk-api').value().port
let slk_admin_port = db.get('slk-admin').value().port

// logging
if (!fs.existsSync(log_dir)){//检测给定的路径是否存在
  fs.mkdirSync(log_dir);
}
const log = bunyan.createLogger({
  name: 'slk-message',
  streams: [{
    level: 'info',
    // type: 'raw',
    stream: process.stdout
  },
  {
    level: 'trace',
    type: 'rotating-file',
    path: path.join(log_dir, 'slk.log'),
    period: '1d',   // daily rotation
    count: 7        // keep 3 back copies
  }]
});

// slk-api (configure)
const slk_api = db.get('slk-api').value()
if (slk_api.launch) {
  execa('node', [path.join(root_path, 'slk-api/slk-api.js')]);
}
// slk-admin (configure admin)
const slk_admin = db.get('slk-admin').value()
if (slk_admin.launch) {
  const admin_source = path.join(root_path, 'slk-admin')
  const py_http_server = path.join(root_path, 'httpy.py')
  // execa('anywhere', ['-h', '0.0.0.0', '-p', slk_admin.port, '-d', admin_source]);
  execa('python', [py_http_server, '--port', slk_admin.port, '--dir', admin_source]);
}

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(port);

app.use(cors())
app.use(bodyParser.json({limit: '1mb'}));//解析 json
app.use(bodyParser.urlencoded({//解析urlencoded 请求体，并返回
  extended: false
}));

// const io = require('socket.io')(port);

console.log("----------------------------------")
console.log("    __  __      __    _       __  ")
console.log("   / / / /_  __/ /   (_)___  / /__")
console.log("  / /_/ / / / / /   / / __ \/ //_/")
console.log(" / __  / /_/ / /___/ / / / / ,<   ")
console.log("/_/ /_/\__, /_____/_/_/ /_/_/|_|  ")
console.log("      /____/                      ")
console.log("----------------------------------")
console.log("* Socket.io Message Server v0.1.0")
console.log("* Running on localhost:" + port + ' ')
if (db.get('slk-api').value().launch) {
  console.log("* Running on localhost:" + slk_api_port + ' (slk-api)')
}
if (db.get('slk-admin').value().launch) {
  console.log("* Running on localhost:" + slk_admin_port + ' (slk-admin)')
}

//存入黑名单用户
function saveBlackListSync(tag, config, db_black) {
  return new Promise((resolve, reject) => {
    db_black.get(tag).push(config).write();
    resolve(true);
  })
}

//添加黑名单用户
app.post('/api/add/blacklist', function (req, res, next) {
  const config = req.body.idcard
  if (blockList.indexOf(config) > -1){
    res.json({ "code": 1, "message": "该身份证号码已存在","idcard":config });
  }else{
    saveBlackListSync('list', config, db_black).then((result) => {
      res.json({ "code": 0, "message": "success","idcard":config });
    });
    blockList = db_black.get('list').value();
  }

})

//删除黑名单用户
function delBlackListSync(tag, config, db_black) {
  return new Promise((resolve, reject) => {
    // db_black.get(tag).remove(config).write();
    db_black.get(tag).pull(config).write();
    resolve(true);
  })
}

//删除黑名单用户
app.post('/api/delete/blacklist', function (req, res, next) {
  const config = req.body.idcard
  delBlackListSync('list', config, db_black).then((result) => {
    res.json({ "code": 0, "message": "success","idcard":config })
    blockList = db_black.get('list').value();
  })
})

// SLK-Message HTTP 接口
app.get('/', function (req, res) {
  res.json({ info: 'Socket.io Message Server', code: 200 });
});

app.post('/message/query', function (req, res) {
  const params = req.body
  if (!params.idcard) {
    res.json({ message: 'idcard param required', code: 101 })
  }
  query_pub_message(params, (err, result) => {
    if (err) log.error(err)
    res.json(result.data)
  })
})

app.post('/message/post', function (req, res) {
  const message = req.body

  var valid = validate(message);
  if (!valid) {
    log.warn(validate.errors)
    res.json({ message: 'failed', code: 105 })
  } else {
    insert_pub_message_multi(message, (err, data) => {
      if (!err) {
        notice_it(message[0].nodeid, message.length)
        log.info('[db]', '(http) pub-message success', 'count: ' + message.length)
        res.json({ message: 'success', code: 200 })
      } else {
        log.error('[db]', '(http) pub-message failed', err)
        res.json({ message: 'failed', code: 104 })
      }
    })
    // save_message(message).then(data => {
    //   notice_it(message[0].nodeid, data.length)
    //   log.info('[db]', '(http) pub-message success', 'count: ' + data.length)
    //   res.json({ message: 'success', code: 200 })
    // }).catch((err) => {
    //   log.error('[db]', '(http) pub-message failed', err)
    //   res.json({ message: 'failed', code: 104 })
    // })
  }
})

app.post('/message/update/read', function (req, res) {
  const params = req.body
  if (!params.uuid || (params.uuid && params.uuid.length <=0)) {
    res.json({ message: 'uuid param required', code: 102 })
  }
  if (!params.device) {
    res.json({ message: 'device param required', code: 103 })
  }
  set_message_read(params.uuid, params.device).then(data => {
    log.info('[db]', 'set message read success', 'count: ' + data.length)
    res.json({ result: 'success', count: data.length })
  }).catch((err) => {
    log.error('[db]', 'set message read failed', err)
    res.json({ result: 'failed', count: -1 })
  })
})

// 用户以及会话对应字典
let uid_sid = new Dictionary();      // PC: { "230125199302142333": "GPjhsMyTJhr7o3v8AAAB" }
let uid_sid_m = new Dictionary();    // MOBILE: { "230125199302142333": "2MGg5WKSWbpdho1RAAAD" }
let sid_uid = new Dictionary();      // { "8mjCQbQLMD4VVftWAAAB": "230125199302142333" }

// PC在线/离线状态发送给移动端
function send_pc_status(idcard, sid, online) {
  socket_id_m = sid;
  if(socket_id_m) {
    log.info('[signal] pc_status', idcard, online ? "pc online" : "pc offline")
    io.sockets.connected[socket_id_m].send({ 'signal': 'pc_status', 'online': online});
  }
}

// disconn_notice
// 当PC断开连接后会向移动端发送消息，除非PC是被另一台PC挤掉线的情况，不发送消息
var disconn_notice = true
function let_disconnect(idcard, socket_id, code) {
  if ( socket_id ) {
    if (code === 1) {
      disconn_notice = false
    }
    log.info('[signal] disconn', code, idcard, socket_id)
    io.sockets.connected[socket_id].send({ 'signal': 'disconn', 'code': code });
    io.sockets.connected[socket_id].disconnect();
  }
}

// 发送room消息提醒，有新的消息
function notice_it(room, count) {
  io.sockets.in(room).emit('pub-message', {'count': count})
  // socket.broadcast.to(rood).emit('pub-message', {'count': count})
}

function save_message(message) {
  let task = message.map((item) => {
    return new Promise((resolve, reject) => {
      insert_pub_message(item, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  })
  return Promise.all(task)
}

function set_message_read(uuids, device) {
  let task = uuids.map((uuid) => {
    return new Promise((resolve, reject) => {
      update_message_read(uuid, device, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  })
  return Promise.all(task)
}


io.on('connection', function(socket) {

  const idcard = socket.handshake.query['idcard']
  const device = socket.handshake.query['device']

  // 校验连接用户是否传入必要参数
  if ( idcard === undefined ) {
    socket.send({"code": -1, "message": "idcard param lost"})
    socket.disconnect();
    log.error('[error] user connect failed (without idcard):', socket.id);
  } else if ( device=== undefined ) {
    socket.send({"code": -2, "message": "device param lost"})
    socket.disconnect();
    log.error('[error] user connect failed (without device):', socket.id);
  } else {
    // 用户连接后默认加入名为idcard的房间
    if (blockList.indexOf(idcard) > -1){//黑名单列表存在
      socket.disconnect();
      log.warn('[warn] user connect failed (idcard in blackList):', socket.id);
    }else{
      socket.join(idcard);
      if ( device === 'pc' ) {
        // send pc online status to mobile
        socket_id_m = uid_sid_m.find(idcard);
        send_pc_status(idcard, socket_id_m, true);
        // T-other pc client
        socket_id = uid_sid.find(idcard)
        let_disconnect(idcard, socket_id, 1)

        uid_sid.add(idcard, socket.id)
      } else {
        // send pc online status to mobild
        if (uid_sid.find(idcard) !== undefined) {
          send_pc_status(idcard, socket.id, true);
        }
        // T-other mobile client
        socket_id = uid_sid_m.find(idcard)
        let_disconnect(idcard, socket_id, 2)

        uid_sid_m.add(idcard, socket.id)
      }
      sid_uid.add(socket.id, idcard)
      log.info('[conn] user connected:', idcard, socket.id, device);
    }
  }

  // 更新用户的 socketid
  upsert_user_sid(idcard, socket.id, device, (err, result) => {
    if (err) { log.error( "[db]", idcard, result.message, socket.id, err) }
    else { log.debug("[db]", idcard, result.message, socket.id) }
  })

  // 当收到默认消息
  socket.on('message', function (message) { // send(emit) message(listener)
    // disconn信号 手机端强制 PC 端下线
    if ( message.signal === 'disconn' ) {
      if ( device !== 'mobile') {
        log.warn('[warning]', idcard, 'pc send tpc signal')
        socket.send({ 'signal': 'notice', 'message': 'tpc signal only mobile client' })
	      return;
      }
      let socket_id = uid_sid.find(idcard)
      if (socket_id) {
	      uid_sid.remove(idcard)
        let_disconnect(idcard, socket_id, 0)
      }
      log.info('[signal]', idcard, 'tpc from mobile')
    }
    // Sign out (PC 主动断开连接)
    if ( message.signal === 'logout' ) {
      if ( device === 'pc') {
        log.info('[conn] pc logout', idcard, socket.id)
        let_disconnect(idcard, socket.id, 3)
        uid_sid.remove(idcard)
      }
    }
  })

  socket.on('pub-message', function(data){

    /* data: [{}, {}, {}] */
    if (!isJSON(data)) {
      log.warn('[warning]', idcard, 'pub-message invalid json string')
      return;
    }

    const message = JSON.parse(data)
    var valid = validate(message);
    if (!valid) {
      socket.send({ 'signal': 'notice', 'message': 'pub-message failed, schema invalid' })
      log.warn(validate.errors)
    } else {
     save_message(message).then(data => {
       notice_it(message[0].nodeid, data.length)
       log.info('[db]', idcard, 'pub-message success', 'count: ' + data.length)
     }).catch((err) => {
       log.error('[db]', idcard, 'pub-message failed', err)
     })
    }
  });

  // 用户加入房间
  socket.on('join', function (room) {
    socket.join(room);
    log.info('[room]', idcard, 'join the room:', room, device)
  });

  // 用户离开房间
  socket.on('leave', function (room) {
    socket.leave(room);
    log.info('[room]', idcard, 'leave the room:', room, device)
  });

  // 用户获取自己所在房间列表
  socket.on('get-rooms', function(){
    let rooms = Object.keys(socket.rooms);
    socket.emit('get-rooms', rooms)
    log.info('[room]', idcard, 'rooms:', rooms, device)
  });

  // 用户断开连接
  socket.on('disconnect', function(){
    if( device === 'pc' ) {

      if (disconn_notice) {
        socket_id_m = uid_sid_m.find(idcard);
        send_pc_status(idcard, socket_id_m, false);
      } else {
        disconn_notice = true
      }
      uid_sid.remove(idcard)
    } else {
      uid_sid_m.remove(idcard)
    }
    sid_uid.remove(socket.id)

    // 将用户离线状态保存到数据库
    //const idcard = sid_uid.find(socket.id)
    user_disconnect(idcard, device, (err, result) => {
      if (err) {
        log.error( "[db]", result.message, idcard, err)
      } else {
        log.debug("[db]", result.message, idcard)
        log.info('[conn] user disconnected', idcard, device);
      }
    })
  });

  // 房间消息
  socket.on('room-chat', function (data) {
    let room = data.room_name
    let room_message = data.room_message
    // socket.broadcast.to(room).emit('room-chat', 'hi, room message' + room);
    // io.sockets.in(room).emit('room-chat', 'room: (' + room + ') message: ' + room_message);
    io.sockets.in(room).emit('room-chat', { room: room, message: room_message });
    log.info('[room_msg]', idcard, 'send to room', room, "message:", room_message)
  })
});

setTimeout(() => {
}, 1000)






