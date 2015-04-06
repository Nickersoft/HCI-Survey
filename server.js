process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var express     = require("express");
var bodyParser  = require("body-parser");
var app     	= express();
var http    	= require('http').Server(app);
var nodemailer  = require("nodemailer");
var url         = require("url");
var qs          = require("querystring");

app.use('/', express.static(__dirname));
app.use('/apps/survey', express.static(__dirname));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/apps/survey/submit', function(req, res) {
    var info_string = "";
    var murl        = url.parse(req.url);
    var qobj        = qs.parse(murl.query);
    var post_data   = JSON.parse(qobj.data);
    var user_data   = post_data.shift();
    var user_keys   = Object.keys(user_data);
    
    info_string += "### USER INFO ###\n";
    for(var a = 0; a < user_keys.length; a++) {
        var el  = user_data[user_keys[a]];
        for(var b = 0; b < el.length; b++) {
            info_string += el[b].name + " : " + el[b].value + "\n";   
        }
    }
    
    info_string += "\n\n";
    var post_keys   = Object.keys(post_data);
    for(var i = 0; i < post_keys.length; i++) {
        var sub_array = post_data[post_keys[i]];
        info_string += "### QUESTION " + (i + 1) + " ###\n";
        for(var x = 0; x < Object.keys(sub_array).length; x++) {
            var keys = Object.keys(sub_array);
            var el  = sub_array[keys[x]];
            for(var y = 0; y < el.length; y++) {
                info_string += el[y].name + " : " + el[y].value + "\n";   
            }
        }
        info_string += "\n\n";
    }

    /*
     * Nodemailer code has been removed to prevent abuse
     */
    
    res.send("200");
});


http.listen(3002, function() {
	console.log('listening on *:3002');
});

