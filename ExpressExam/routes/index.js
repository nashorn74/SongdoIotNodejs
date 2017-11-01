var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'HelloWorld' });
  res.send(JSON.stringify({method:'GET', url:'/'}));
});

router.post('/', function(req, res, next) {
	res.send(JSON.stringify({method:'POST', url:'/'}));
});

router.put('/', function(req, res, next) {
	res.send(JSON.stringify({method:'PUT', url:'/'}));
});

router.delete('/', function(req, res, next) {
	res.send(JSON.stringify({method:'DELETE', url:'/'}));
});

module.exports = router;
