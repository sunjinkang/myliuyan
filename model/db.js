var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://127.0.0.1:27017/web1703";
function _connectDB(callback){
    MongoClient.connect(url,function(err,db){
        if(err){
            //console.log("连接失败");
            return;
        }
        callback(null,db);
        //console.log("连接成功");
    })
}
exports.insertOne = function(collectionName,json,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).insertOne(json,function(err,result){
            callback(err,result);
        })
        db.close();
    })
}
exports.find = function(collectionName,json,C,D){
    if(arguments.length==3){
        var callback = C;
        var skipnum = 0;
        var limitnum = 0;
        var sort = {};
    }else if(arguments.length==4){
        var callback = D;
        var args = C;
        var skipnum = args.pageSize*(args.page-1)||0;
        var limitnum = args.pageSize||0;
        var sort = args.sort||0;
    }
    _connectDB(function(err,db){
        var all = db.collection(collectionName).find(json).skip(skipnum).limit(limitnum).sort(sort);
        all.toArray(function(err,docs){
            if(err){
                callback(err,null);
                db.close();
                return;
            }
            callback(null,docs);
            db.close();
        })
    })
}
exports.deleteOne = function(collectionName,json,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).deleteOne(json,function(err,result){
            callback(err,result);
        })
        db.close();
    })
}
//定义总查询数方法，拿出总记录数
exports.findAllCount = function(collectionName,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).count({}).then(function(count){
            //console.log(count);
            callback(count);
            db.close();
        })
    })
}

exports.updateMany = function (collectionName, json1, json2, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).updateMany(
            json1,
            json2,
            function (err, results) {
                callback(err, results);
                db.close();
            });
    })
}