// 封装的字典
function add(key, value){   // 添加字典的键值(key:value)
  this.dataStore[key] = value;
}
function find(key){         // 根据键(key)查找对应的值(value),返回值value
  return this.dataStore[key];
}
function remove(key){       // 根据键(key)删除对应的值(value)
  delete this.dataStore[key];
}
function count(){           // 计算字典中的元素个数
  var n = 0;
  for(var key in Object.keys(this.dataStore)){
    ++n;
  }
  return n;
}
function Dictionary(){
  this.dataStore = new Array(); // 定义一个数组，保存字典元素
  this.add = add;               // 添加字典内容(key:value)
  this.find = find;             // 根据键(key)查找并返回对应的值(value)
  this.remove = remove;         // 删掉相对应的键值
  this.count = count;           // 计算字典中的元素的个数
}

function is_json(str) {
  if ( /^\s*$/.test(str) ) return false;
  str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
  str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
  str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
  return (/^[\],:{}\s]*$/).test(str);
}


exports.Dictionary = Dictionary;
exports.is_json= is_json;


