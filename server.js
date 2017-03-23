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
var GET_ORDER_BY_DATE = "select distinct a.name,a.tel,b.status,b.id from (select * from tbl_orderitem a inner join tbl_user b on a.user_id=b.id) a inner join (select a.*,b.status  from tbl_order a inner join tbl_status b on a.status_id=b.id where a.date='2017-03-23' ) b on a.order_id=b.id";
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
//---------------------Handle get request --------------------------
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (request, response, next) {
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
app.get('/Items', function (req, res, next) {
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
app.get('/login', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Method", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
//    console.log(req.query);
    var user = req.query.user.toString();
    var pass = req.query.pass.toString();
    db.oneOrNone("select role from tbl_user where name=${name} and password=${pass}", {name: user, pass: pass}).then(function (value) {
        console.log(JSON.stringify(value));
        res.write(JSON.stringify(value));
//        res.flush();
        res.end();
    }).catch(function (error) {
        if (error)
            throw error;
    });
});
app.get('/detail', function (req, res, next) {
    var id = req.query.id;
    db.manyOrNone("Select a.*,b.name from tbl_orderitem a inner join tbl_item b on a.item_id=b.id where a.order_id=${id} ", {id: id}).then(function (row) {

    }).catch(function (err) {
        if (err)
            throw err;
    });
});
app.get('/createOrder', function (req, res, next) {
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

app.all('/getOrderByDate', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Access-Control-Allow-Origin');
    res.header('Access-Control-Allow-Methods', '*');
    if (req.method === "GET") {
        db.manyOrNone(GET_ORDER_BY_DATE, {day: req.query.day}).then(function (value) {
            console.log(JSON.stringify(value));
            res.write(JSON.stringify(value));
            res.end();
        }).catch(function (err) {
            if (err)
                throw err;
        });
    } else {
        console.log(req.method);
        res.end();
    }
});
app.all('/checkOut', function (req, res, next) {
    console.log(req.body);
//    res.header("Access-Control-Allow-Origin:*");
//    res.header("Access-Control-Allow-Method:GET, PUT, POST, DELETE");
//    res.header("Access-Control-Allow-Headers:Content-type");
    res.header('Access-Control-Allow-Origin: *');
    res.header('Access-Control-Allow-Headers: Content-Type,Access-Control-Allow-Origin');
    res.header('Access-Control-Allow-Methods: POST');
    if (req.method === "POST") {
        var jsBody = req.body;
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
                res.write("sent");
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
        console.log(req.method + " is sent");
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Access-Control-Allow-Origin,origin');
        res.status(200);
        res.end();
    }
    console.log(JSON.stringify(req.headers));
});
app.get('/id', function (req, res, next) {
    var id = req.query.id;
    db.many("select * from tbl_orderItem a inner join tbl_item b on a.item_id=b.id  where a.order_id=${id}", {id: id}).then(function (row) {
        res.write(JSON.stringify(row));
        console.log(JSON.stringify(row));
        res.end();
    }).catch(function (error) {
        if (error)
            throw error;
    });
});
//----------------------Post Server----------------------------------
var server = app.listen(process.env.PORT || 8080, function () {
    console.log('listening on ' + server.address().port);
});