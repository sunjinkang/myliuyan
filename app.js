var express = require("express");
var app = express();
var router = require("./controllers");
var fs = require("fs");
var gm = require("gm");
var session = require('express-session');
app.listen(4000);
app.use(express.static("./public"));
app.use(express.static("./scripts"));
app.use(express.static("./uploads"));
app.set("view engine","ejs");
app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.get("/",router.showIndex);
app.get("/login",router.login);
app.get("/doLogin",router.pleaseLogin);
app.get("/reGist",router.reGist);
app.get("/doreGist",router.insertOne);
app.get("/clear",router.clear);
app.get("/change",router.changeAvatar);
app.get("/doCut",router.doCut);
app.post("/up",router.doPost);
app.get("/cut",router.cutAvatar);
app.get("/findByPage",router.findData);
app.get("/findByName",router.findAvatar);
app.get("/insert",router.insertWord);
app.get("/delete",router.deleteOne);