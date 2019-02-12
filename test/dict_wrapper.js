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

var dic = new Dictionary();

dic.add("one", 1);
dic.add("two", 2);
dic.add("three", 3);
console.log(dic.find("one"))
console.log(dic.count())
dic.remove("three")
console.log(dic.count())




