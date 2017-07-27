var fs = require("fs");
var gm = require("gm");
var path = require("path");
var db = require("../model/db.js");
var sd = require("silly-datetime");
var md5 = require("../model/md5.js");
var formidable = require("formidable");
var ObjectId = require("mongodb").ObjectID;
var pageSize = 6;
exports.showIndex = function(req,res){
    db.findAllCount("note",function(count){
        count = Math.ceil(count/pageSize);
        var avatar = req.session.avatar;
        if(req.session.login=="1"){
            var username = req.session.username;
            res.render("index",{
                "count":count,
                "src":"",
                "status":"show",
                "before":"hide",
                "after":"",
                "active":"all",
                "username":username,
                "avatar":avatar,
                "warn":"",
                "login":true
            });
        }else{
            res.render("login",{
                "count":count,
                "src":"pic.jpg",
                "status":"",
                "before":"",
                "after":"hide",
                "active":"",
                "username":"",
                "avatar":"",
                "warn":"",
                "login":false
            });
        }
    })
};
exports.login = function(req,res){
    res.render("login",{
        "src":"",
        "status":"hide",
        "before":"",
        "after":"hide",
        "username":""
    });
};
exports.pleaseLogin = function(req,res){
    db.find("user",{"name":req.query.name},function(err,result){
        var rname = req.query.name;
        var rpwd = req.query.pwd;
        rpwd = md5(rpwd);
        if(rname==result[0].name&&rpwd==result[0].pwd){
            req.session.username = result[0].name;
            req.session.login = "1";
            var avatar = result[0].avatar;
            req.session.avatar = avatar;
            db.findAllCount("note",function(count){
                count = Math.ceil(count/pageSize);
                res.render("index",{
                    "count":count,
                    "src":"images/pic.jpg",
                    "status":"show",
                    "before":"hide",
                    "after":"",
                    "active":"all",
                    "username":rname,
                    "avatar":avatar,
                    "login":true
                });
            })
        }else{
            res.send("用户名或密码错误,请重新输入!");
        }
    })
};
exports.reGist = function(req,res){
    res.render("regist",{
        "src":"",
        "status":"hide",
        "before":"",
        "after":"hide",
        "username":""
    });
};
exports.insertOne = function(req,res){
    db.find("user",{"name":req.query.name},function(err,result){
        if(result[0]){
            res.send("用户名重复，请重新输入！");
        }else{
            var name = req.query.name;
            var pwd = req.query.pwd;
            pwd = md5(pwd);
            db.insertOne("user",{"name":name,"pwd":pwd,"avatar":"pic.jpg"},function(err,result){
                if(err){
                    return;
                }
                res.redirect("/");
            })
        }
    });
};
exports.changeAvatar = function(req,res){
    if(req.session.login=="1"){
        var rName = req.session.username;
        res.render("change",{
            "src":"images/pic.jpg",
            "status":"show",
            "before":"hide",
            "after":"",
            "username":rName,
            "login":true
        });
    }else{
        db.findAllCount("note",function(count){
            count = Math.ceil(count/pageSize);
            res.render("login",{
                "count":count,
                "src":"pic.jpg",
                "status":"",
                "before":"",
                "after":"hide",
                "username":"",
                "avatar":"",
                "warn":"请先登录！",
                "login":true
            });
        })

    }
};
exports.cutAvatar = function(req,res){
    var rName = req.session.username;
    var avatar = req.session.avatar;
    res.render("cut",{
        //"src":"images/pic.jpg",
        "status":"show",
        "before":"hide",
        "after":"",
        "username":rName,
        "avatar":avatar
    });
};
exports.doCut = function(req,res){
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;
    gm("./uploads/"+filename).crop(w,h,x,y).write("./uploads/"+filename,function(err){
        if(err){
            res.send(err);
            return;
        }
        db.updateMany("user",{"name":req.session.username},{$set:{"avatar": req.session.avatar}},function(err,result){
            if(err){
                res.send(err);
                return;
            }
            res.send("1");
        })
    })
};
exports.doPost = function(req,res){
    var form = new formidable.IncomingForm();
    form.uploadDir = "./uploads";
    var allFile = [];
    form.on("file",function(field,file){
            allFile.push([field,file]);
        })
        .parse(req,function(err,fields,files){
            if(err){
                res.send(err);
            }
            allFile.forEach(function(file,index){
                var fName = file[1].name;
                var oldPath = file[1].path;
                var newPath = "./uploads/"+req.session.username + ".jpg";
                fs.rename(oldPath,newPath,function(err){
                    if(err){
                        res.send("改名失败");
                        return;
                    }
                    req.session.avatar = req.session.username + ".jpg";
                    var rname = req.session.username;
                    var avatar = req.session.avatar;
                    res.render("cut",{
                        //"src":"images/pic.jpg",
                        "status":"show",
                        "before":"hide",
                        "after":"",
                        "username":rname,
                        "avatar":avatar
                    });
                })
            })
        })
};
exports.findData = function(req,res){
    var page = req.query.page;
    db.find("note",{},{"pageSize":pageSize,"page":page,"sort":{"time":-1}},function(err,result){
        if(err){
            res.send(err);
            return;
        }
        res.send(result);
    })
};
exports.findAvatar = function(req,res){
    var name = req.query.name;
    db.find("user",{"name":name},function(err,result){
        if(err){
            res.send(err);
            return;
        }
        res.send(result);
    })
};
exports.insertWord = function(req,res){
    var login = req.session.login;
    if(login==1){
        var now = sd.format(new Date(),"YYYY-MM-DD HH:mm:ss");
        db.insertOne("note",{"name":req.session.username,"words":req.query.words,"time":now},function(err,result){
            if(err){
                return;
            }
            res.redirect("/");
        })
    }else{
        res.render("login");
    }
};
exports.deleteOne = function(req,res){
    if(req.session.login=="1"){
        var id = req.query.id;
        id = ObjectId(id);
        db.deleteOne("note",{"_id":id},function(err,result){
            if(err){}
            return;
        })
        res.redirect("/");
    }else{
        db.findAllCount("note",function(count){
            count = Math.ceil(count/pageSize);
                res.render("login",{
                    "count":count,
                    "src":"pic.jpg",
                    "status":"",
                    "before":"",
                    "after":"hide",
                    "username":"",
                    "avatar":"",
                    "warn":"请先登录！",
                    "login":false
                });
        })

    }
};
exports.clear = function(req,res){
    req.session.username = "";
    req.session.login = "";
    res.redirect("/");
};