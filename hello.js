var http = require('http');
var fs = require('fs');
var length = 0;
fs.readFile('./hello.js', function(err,data) {
	if (err) {
		console.log(err);
	} else {
		console.log(data);
		//console.log(data.toString());
		length = data.toString().length;
		console.log("length="+length);
	}
});
console.log("length="+length);
http.createServer(function(req,res) {
	console.log(req.method+','+req.url);
	res.writeHead(200,
		{'Content-Type':'text/plain'});
	res.end('Hello World\n');
}).listen(80);
console.log('Server running at port 80');