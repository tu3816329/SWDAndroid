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
    res.status(200);
    res.end();
});
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
app.get('/login', function (req, res) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Method", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    console.log(req.query);
    var user = req.query.user.toString();
    var pass = req.query.pass.toString();
    db.oneOrNone("select role from tbl_user where name=${name} and password=${pass}", {name: user, pass: pass}).then(function (value) {
        res.write(JSON.stringify(value));
//        res.flush();
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

app.get('/getOrderByDate', function (req, res) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Method", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    db.manyOrNone("Select id from tbl_order where date=${day}", {day: req.query.day}).then(function (value) {
        console.log(JSON.stringify(value));
        res.write(value.id);
        res.end();
    }).catch(function (err) {
        if (err)
            throw err;
    });
});
app.all('/checkOut', function (req, res) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Method", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    console.log(req.body)
    if (req.method === "POST") {
        var jsBody = req.body;
//        console.log(req.body)
        var order_id = req.body.id;
        var user_name = req.body.userId;
        db.oneOrNone("Select id from tbl_user where name=${name}", {name: user_name}).then(function (row) {
            var value = [];
            for (var i = 0; i < req.body.item.length; i++) {
                var id = req.body.item[i].id;
                var name = req.body.item[i].name;
                var price = req.body.item[i].price;
                var amount = req.body.item[i].amount;
                var val = {order_id: order_id, item_id: id, amount: amount, user_id: row.id};
                value.push(val);
            }
            var cs = new pgPromise.helpers.ColumnSet(['order_id', 'item_id', 'amount', 'user_id'], {table: 'tbl_orderitem'});
            var query = pgPromise.helpers.insert(value, cs);
            db.none(query).then(function (data) {
                console.log(JSON.stringify(value));
                res.end();
            }).catch(function (error) {
                if (error)
                    throw error;
            });
        }).catch(function (error) {
            if (error)
                throw error;
        });
    } else {
        console.log(req.method);
    }
    res.end();
});
//----------------------Post Server----------------------------------
var server = app.listen(process.env.PORT || 8080, function () {
    console.log('listening on ' + server.address().port);
});