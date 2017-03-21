/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//var api = require('api-ai');
//var pg = require('pg');
//app.set('port', process.env.PORT || 3000);
//------------------------------------------------
//var SELECT_BY_PRODUCT_NAME_QUERY
var http = require('http');
var url = require('url');
var sQuerry = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var option = {
    disconnect: function (client, dc) {
        var cp = client.connectionParameters;
        console.log("Disconnecting from database ", cp.database);
    }
};
var pgPromise = require('pg-promise')(option);
var app = express();
//-------------Connection Config For OnlineDB------------------------
var conConfig = {
    host: 'ec2-54-235-245-255.compute-1.amazonaws.com',
    port: 5432,
    database: 'dc3hgc1mg58udk',
    user: 'kvnqtzahmjwulc',
    password: '10cfec70ad23ffc937da846fa659b065c0f82e3f24656006d920e9a6ea26c1a7',
    ssl: true,
    poolSize: 25
};
var db = pgPromise(conConfig);
//-------------Connection Config For Offline DB------------------------
//var conString = "postgres://postgres:tu3816329@localhost:5432" + "/SWD";
//var db = pgPromise(conString);
//------------------------------------------------------------------
module.exports = db;
module.exports = pgPromise;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//------------------SupportFunction-----------------------------------------
var GET_ALL_ITEM = "Select * from tbl_Item";
var GET_ALL_ITEM_BY_ID = "Select * from tbl_Item where id=${id}";
var GET_ALL_ITEM_BY_NAME = "Select * from tbl_Item where name=${name}";
var GET_ALL_ORDER = "";
var GET_ORDER_BY_ID = "";

function getItemByID(id, req, res) {
    var content = "";
    db.manyOrNone(GET_ALL_ITEM_BY_ID, {id: id}).then(function (row) {
        var items = [];
        for (var i = 0; i < row.length; i++) {
            items.push({"id": row[i].id.toString(), "name": row[i].name.toString()
                , "description": row[i].description.toString(),
                "price": row[i].price.toString()
            });
        }
        for (var j = 0; j < items.length; j++) {
            content += items[j].name + '\n';
        }
        res.writeHeader(200, {'Content-type': "text/html"});
        res.write("Result: \n" + content);
        res.end();
    }).catch(function (error) {
        if (error)
            throw error;
    });
}

//------------------Handle Post Request--------------------------------------
app.post('/submit', function (req, res) {
    console.log(req.body);
    res.header("Content-type:application/json").json(req.body);
//    res.redirect(req.location);
    res.status(200);
    res.end();
});
/*
 app.post('/webhook', function (request, response) {
 //    console.log(request.body);
 var jsBody = request.body;
 response.writeHeader(200, {'Content-type': "Application/json"});
 var content = "";
 //----------------------Handle Show Menu Request-------------------------
 if (jsBody.result.action.toString().toUpperCase() === "show_menu".toString().toUpperCase()) {
 if (jsBody.result.parameters.Type !== "") {
 db.one(SELECT_PRODUCT_TYPE_QUERY + " where name LIKE ${name}", {name: jsBody.result.parameters.Type}).then(function (data) {
 var id = data.id;
 if (id !== null) {
 db.many(SELECT_DETAIL_PRODUCT_TYPE_QUERY + " where product_type_id=${id} ", {id: id}).then(function (row) {
 
 console.log("row:" + row);
 var display = "";
 var speech = "We have \\n";
 for (var i = 0; i < row.length; i++) {
 if (i == (row[i].length - 1)) {
 speech += "And " + row.name + " \\n";
 } else {
 speech += row[i].name + " \\n";
 }
 }
 speech += "What kind of " + jsBody.result.parameters.Type.toString().toLowerCase() + " want?";
 var text = speech;
 //                        speech = "Here's your menu.";
 var content = {'speech': speech,
 'displayText': text,
 'data': row,
 'contextOut': [
 {'name': "menuWatched", 'lifespan': 1
 }
 ], 'source': "Thien Tu", 'followupEvent': {
 }
 };
 response.write(JSON.stringify(content));
 console.log("Send response: " + JSON.stringify(content));
 response.end();
 }).catch(function (error) {
 if (error)
 throw error;
 });
 } else {
 
 }
 });
 }
 }
 if (jsBody.result.action.toString().toUpperCase() === "finish".toString().toUpperCase()) {
 db.many(SELECT_ALL_DETAIL_QUERY).then(function (row) {
 for (var product in row) {
 if (product.name.toString().include()) {
 
 }
 }
 });
 }
 });
 */

//---------------------Handle get request --------------------------


app.get('/', function (request, response) {
    console.log("Connecting to DB.........");
    var content = "";


    db.manyOrNone(GET_ALL_ITEM_BY_ID, {id: request.query.id}).then(function (row) {
        var productType = [];
        for (var i = 0; i < row.length; i++) {
            productType.push({"id": row[i].id.toString(), "name": row[i].name.toString()
                , "description": row[i].description.toString(),
                "price": row[i].price.toString()
            });
        }
        for (var j = 0; j < productType.length; j++) {
            content += productType[j].name + '\n';
        }
        response.writeHeader(200, {'Content-type': "text/html"});
        response.write("Result: \n" + content);
        response.end();
    }).catch(function (error) {
        if (error)
            throw error;
    });
});
app.get('/Items', function (req, res) {
    console.log("Connection to tbl_Item");
    db.manyOrNone(GET_ALL_ITEM).then(function (row) {
        var list = {'item': []};
//        var obj = JSON.parse(list);
        for (i = 0; i < row.length; i++) {
            list.item.push({'id': row[i].id.toString(), 'name': row[i].name.toString()
                , 'description': row[i].description.toString(),
                'price': row[i].price.toString(), 'imageLink': row[i].imagelink});
        }
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHeader(200, {'Content-type': "Application/json"});
        res.write(JSON.stringify(list));
        res.end();
    }).catch(function (error) {
        if (error)
            throw error;
    });
});

app.get('/id', function (request, response) {
    console.log("Connecting to DB.........");
    var list = getItemByID(request.query.id, request, response);
});
app.get('/createOrder', function (req, res) {
    var today = new Date();
    var day = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    db.none('INSERT INTO tbl_Order(date,time,status_id) VALUES (${date},${time},1)',
            {date: day, time: time}).then(function (row) {
        db.oneOrNone("SELECT * FROM tbl_Order ORDER BY id DESC limit 1").then(function (data) {
            res.setHeader("Access-Control-Allow-Origin", "*");
//            res.writeHeader   (200, {'Content-type': "text/html"});
            var id = data.id.toString();
            console.log(id);
            res.write(id);
            res.end();
        }).catch(function (error) {
            if (error)
                throw error;
        });
    }).catch(function (error) {
        if (error)
            throw error;
    });
});
app.post('/checkOut')
//----------------------Post Server----------------------------------
var server = app.listen(process.env.PORT || 8080, function () {
    console.log('listening on ' + server.address().port);
});