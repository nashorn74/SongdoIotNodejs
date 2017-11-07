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
//--------------------------------------------------
var MongoClient = require('mongodb').MongoClient;
// Connection URL
var url = 'mongodb://localhost:27017/iot';
var dbObj = null;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  console.log("Connected correctly to server");
  dbObj = db;
});
//-------------------------------------------------
var redis = require('redis');
var redisClient = redis.createClient();

//전체 사용자 목록 조회 : GET - /users
router.get('/', function(req, res, next) {
  connection.query('select id,email,name,age from user', 
  	function(err, results, fields) {
  		if (err) {
  			res.send(JSON.stringify(err));
  		} else {
  			res.send(JSON.stringify(results));
  		}
  	});
});
//특정 사용자 정보 조회 : GET - /users/id
router.get('/:id', function(req, res, next) {
	//Redis에 캐시된 데이터 유무 확인
	//복합키 - "GET:/users/id:7" (: -> 구분자) METHOD:URL:VALUE *************************
	redisClient.get('GET:/users/id:'+req.params.id, function(err, data) {
		if (err) res.send(JSON.stringify(err));
		else {
			if (data != null) {//Redis에 저장된 데이터가 있을 경우
				res.send(data);
			} else {//Redis에 저장된 데이터가 없을 경우 --> 직접 쿼리 실행
				connection.query('select id,email,name,age from user where id=?',
					[ req.params.id ], function(err, results, fields) {
						if (err) {
							res.send(JSON.stringify(err));
						} else {
							if (results.length > 0) {
								//Application Side Join--------------------------
								connection.query(
									'select * from device where user_id=?',
									[ req.params.id ], 
									function(err2, results2, fields2) {
										if (err2) res.send(JSON.stringify(err2));
										else {
											var logs = dbObj.collection('logs');
											logs.find({user_id:Number(req.params.id)}).
												toArray(function(err3, results3) {
													if (err3)
														res.send(JSON.stringify(err3));
													else {
														results[0].devices = results2;
														results[0].logs = results3;
														redisClient.setex('GET:/users/id:'+req.params.id, 300,
															JSON.stringify(results[0]));
														res.send(JSON.stringify(results[0]));
													}
												});								
										}
									});			
								//-----------------------------------------------		
							} else {
								res.send(JSON.stringify({}));
							}
						}
					});
				//res.send(JSON.stringify({id:req.params.id}));
			}
		}
	});
});
//사용자 정보 추가 (가입) : POST - /users
var crypto = require('crypto');
router.post('/', function(req, res, next) {
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;
	var age = req.body.age;
	console.log(email+','+password+','+name+','+age);
	var hash = crypto.createHash("sha512").update(password).digest('base64');
	console.log(hash);
	connection.query(
		'insert into user(email,password,name,age) values(?,?,?,?)',
		[ email, hash, name, age ],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	//res.send(JSON.stringify({email:email,password:hash,name:name,age:age}));
});
//사용자 정보 수정 : PUT - /users/id
router.put('/:id', function(req, res, next) {
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;
	var age = req.body.age;
	console.log(email+','+password+','+name+','+age);
	var query = 'update user set ';
	var conditions = [];
	if (email != undefined) {
		query += "email=?,"; conditions.push(email);
	}
	if (password != undefined) {
		var hash = crypto.createHash("sha512").update(password).digest('base64');
		query += "password=?,"; conditions.push(hash);
	}
	if (name != undefined) {
		query += "name=?,"; conditions.push(name);
	}
	if (age != undefined) {
		query += "age=?"; conditions.push(age);
	}
	if (query[query.length-1] == ',') //쉼표 제거
		query = query.substring(0,query.length-1);
	query += " where id=?";
	conditions.push(req.params.id);
	connection.query(query, conditions,
		//'update user set email=?,password=?,name=?,age=? where id=?',
		//[ email, hash, name, age, req.params.id ],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	//res.send(JSON.stringify({id:req.params.id}));
});
//사용자 정보 삭제 (탈퇴) : DELETE - /users/id
router.delete('/:id', function(req, res, next) {
	connection.query('delete from user where id=?',
		[ req.params.id ], function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	//res.send(JSON.stringify({id:req.params.id}));
});

module.exports = router;
