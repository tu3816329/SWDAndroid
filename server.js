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
//var conString = "postgres://postgres:tu3816329@localhost:5432" + "/CoffeeShop";
//var db = pgPromise(conString);
//------------------------------------------------------------------
module.exports = db;
module.exports = pgPromise;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//------------------SupportFunction-----------------------------------------

//------------------Handle Post Request--------------------------------------
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

app.get('/form', function (request, response) {
    console.log("Connecting to DB.........");
    var content = "";
    db.many("Select * from tbl_Item").then(function (row) {
        var productType = [];
        for (var i = 0; i < row.length; i++) {
            productType.push({"name": row[i].name.toString()});
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
}
);
//----------------------Post Server----------------------------------
var server = app.listen(process.env.PORT || 8080, function () {
    console.log('listening on ' + server.address().port);
});
//------------------PG code---------------------------------------------
/*
 var client = pg.Client(conString);
 pg.defaults.ssl = true;
 pg.defaults.poolSize = 25;
 pg.connect(conString, function (error, client) {
 if (error)
 throw error;
 var query = client.query('Select * From tbl_Drinks;');
 query.on('row', function (row) {
 content += JSON.stringify(row).toLocaleString() + "/n";
 console.log(JSON.stringify(row));
 });
 query.on('end', function () {
 console.log("Client was disconnected.");
 client.end();
 });
 });
 app.get('/', function (request, response) {
 console.log("GET");
 response.writeHeader(200, {'Content-Type': 'Text/Html'});
 var content = "";
 var ul = url.parse(request.url, true).query;
 content += "<h1>Your name is " + ul.name + "</h1>";
 response.write(content);
 response.end();
 });
 var server = http.createServer(function (request, response) {
 if (request.method === "GET") {
 console.log("GET");
 response.writeHeader(200, {'Content-Type': 'Text/Html'});
 var content = "";
 var ul = url.parse(request.url, true).query;
 content += "<h1>Your name is " + ul.name + "</h1>";
 response.write(content);
 response.end();
 } else if (request.method === "POST") {
 response.writeHeader(200, {'Content-type': "Application/json"});      
 var content = {'speech': 'Please wait a moment for your order.', 'displayText': 'Please wait a moment for your order.We are making it!', 'data': {}, 'contextOut': [], 'source': "Thien Tu"};
 response.write(JSON.stringify(content));
 console.log("Send response: " + JSON.stringify(content));
 response.end();
 console.log("POST");
 }
 }).listen(process.env.PORT || 8080, function () {
 console.log('listening on ' + server.address().port);
 });
 
 */

