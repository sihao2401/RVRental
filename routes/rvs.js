var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/rvrental');

router.get('/', function(req, res) {
    var collection = db.get('Rvs');
    collection.find({}, function(err, Rvs){
        if (err) throw err;
        res.json(Rvs);
    });
});


router.get('/:id', function(req, res) {
    var collection = db.get('Rvs');
    collection.findOne({ _id: req.params.id}, function(err, Rvs){
        if (err) throw err;
      	res.send({Rvs:Rvs});
    });
});

router.post('/getInfoByPage', function(req,res){
    var collection = db.get('Rvs');
    var pageSize = req.body.pageSize || 5;
    var page = req.body.page || 1;
    var skip = (page-1)*pageSize;
    collection.find({}, {limit: Number(pageSize), skip :skip},function(err,Rvs){
        if(err) throw err;
        res.send({list:Rvs});
    });
});


module.exports = router; 

