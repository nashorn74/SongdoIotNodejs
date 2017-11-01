var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'test1234',
  database : 'iot'
});
connection.connect();
//전체 디바이스 목록 조회
router.get('/', function(req, res, next) {
	connection.query('select * from device',
		function(err, results, fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(results));
			}
		});
});
//특정 디바이스 정보 조회
router.get('/:id', function(req, res, next) {
	connection.query('select * from device where id=?',
		[ req.params.id ], function(err, results, fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify(results[0]));
				} else {
					res.send(JSON.stringify({}));
				}
			}
		});
});
//디바이스 등록
router.post('/', function(req, res, next) {
	var user_id = req.body.user_id;
	var mac_address = req.body.mac_address;
	connection.query(
		'insert into device(user_id,mac_address) values(?,?)',
		[ user_id, mac_address ], function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
});
//디바이스 제거
router.delete('/:id', function(req, res, next) {
	connection.query('delete from device where id=?',
		[ req.params.id ], function(err, result) {
			if (err) res.send(JSON.stringify(err));
			else res.send(JSON.stringify(result));
		});
});

module.exports = router;
