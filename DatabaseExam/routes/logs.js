var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
// Connection URL
var url = 'mongodb://localhost:27017/iot';
var dbObj = null;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  console.log("Connected correctly to server");
  dbObj = db;
});
//전체 로그 목록 조회
router.get('/', function(req, res, next) {
	var logs = dbObj.collection('logs');
	logs.find({}).toArray(function(err, results) {
		if (err) res.send(JSON.stringify(err));
		else res.send(JSON.stringify(results));
	});
});
//특정 로그 정보 조회
var ObjectID = require('mongodb').ObjectID;
router.get('/:id', function(req, res, next) {
	var logs = dbObj.collection('logs');
	logs.findOne(
		{_id:ObjectID.createFromHexString(req.params.id)},
		function(err, result) {
			if (err) res.send(JSON.stringify(err));
			else res.send(JSON.stringify(result));
		});
});
//로그 정보 추가
router.post('/', function(req, res, next) {
	var user_id = req.body.user_id;
	var action_code = req.body.action_code;
	var action_data = req.body.action_data;
	var obj = {//저장될 객체 정보
		user_id : Number(user_id),
		action : {
			code : Number(action_code),
			data : action_data
		},
		created_at : new Date()
	};
	var logs = dbObj.collection('logs');
	logs.save(obj, function(err, result) {
		if (err) res.send(JSON.stringify(err));
		else res.send(JSON.stringify(result));
	});
});
//로그 정보 삭제
router.delete('/:id', function(req, res, next) {
	var logs = dbObj.collection('logs');
	logs.remove(
		{_id:ObjectID.createFromHexString(req.params.id)},
		function(err, result) {
			if (err) res.send(JSON.stringify(err));
			else res.send(JSON.stringify(result));
		});
});
module.exports = router;
