var express = require('express');
var router = express.Router();
var sd = require('silly-datetime');

var monk = require('monk');
var db = monk('localhost:27017/rvrental');

var multiparty = require('multiparty');


router.get('/rvs/new', function(req, res) {
  res.render('new');
});

router.post('/rvs/add', function(req, res){
    var form = new multiparty.Form();
    form.uploadDir='public/images';
    form.parse(req, function(err, fields, files) {
        var year=fields.year[0];
        var make=fields.make[0];
        var model = fields.model[0];
        var type = fields.type[0];
        var price = fields.price[0];
        var description = fields.description[0];
        var stock = fields.stock[0];
        var location = fields.location[0];
        var image1 = files.image1[0].path
        var image2 = files.image2[0].path
        var image3 = files.image2[0].path
        var img1 = new Array(); 
        var img2 = new Array(); 
        var img3 = new Array(); 
        img1=image1.split("/");
        img2=image2.split("/");
        img3=image3.split("/");
        var images = [img1[2],img2[2],img3[2]];
        var collection = db.get('Rvs');
        collection.insert({
            year: year,
            make: make,
            model: model,
            image: images,
            type: type,
            price: price,
            description: description,
            stock: stock,
            location: location,
            isdeleted: false
        }, function(err, rvs){
            if (err) throw err;
            res.redirect('/');
        });
    });
});

router.delete('/rvs/:id', function(req, res){
    var collection = db.get('Rvs');
    collection.findOne({_id: req.params.id},function(err,Rv){
        if (Rv.isdeleted) {
            collection.findOneAndUpdate({ _id: req.params.id }, 
            { $set:
              {
                isdeleted : false
              }
            },function(err, Rvs){
                if (err) throw err;
                res.redirect('/');
            });
        }else{
            collection.findOneAndUpdate({ _id: req.params.id }, 
            { $set:
              {
                isdeleted : true
              }
            },function(err, Rvs){
                if (err) throw err;
                res.redirect('/');
            });
        }
    });
});

router.get('/rvs/:id', function(req, res) {
    var collection = db.get('Rvs');
    collection.findOne({ _id: req.params.id}, function(err, Rv){
        if (err) throw err;
        console.log(Rv);
       res.render('show', { Rv: Rv});
    });
});

router.get('/rvs/edit/:id', function(req, res){
    var collection = db.get('Rvs');
    collection.findOne({_id: req.params.id}, function(err, Rv){
        if (err) throw err;
        res.render('editrv', { Rv: Rv});
    });
});

router.put('/rvs/edit/:id', function(req, res){
    var form = new multiparty.Form();
    form.uploadDir='public/images';
    form.parse(req, function(err, fields, files) {
        var year=fields.year[0];
        var make=fields.make[0];
        var model = fields.model[0];
        var type = fields.type[0];
        var price = fields.price[0];
        var description = fields.description[0];
        var stock = fields.stock[0];
        var location = fields.location[0];
        var image1 = files.image1[0].path
        var image2 = files.image2[0].path
        var image3 = files.image2[0].path
        var img1 = new Array(); 
        var img2 = new Array(); 
        var img3 = new Array(); 
        img1=image1.split("/");
        img2=image2.split("/");
        img3=image3.split("/");
        var images = [img1[2],img2[2],img3[2]];
        var collection = db.get('Rvs');
        collection.update({_id: req.params.id}, 
        { $set:
            {
                year: year,
                make: make,
                model: model,
                image: images,
                type: type,
                price: price,
                description: description,
                stock: stock,
                location: location,
            }
        }, function(err, rvs){
            if (err) throw err;
            res.redirect('/');
        });
    });
});


// add to cart
router.post('/addcart',function (req,res) {
  if (req.session.userinfo) {
    var days = req.body.days;
    var total = req.body.total;
    var productid = req.body.pid;
    var fromdate = req.body.from;
    var todate = req.body.to;
    var ordertime=sd.format(new Date(), 'MM/DD/YYYY HH:mm');
    db.get('Rvs').findOne({_id:productid},function(err, rv){
       var unitprice = rv.price;
       var image = rv.image[0];
       var name = rv.make;
       var userid = req.session.userinfo._id;
       var username = req.session.userinfo.username;
       db.get('cart').insert({
          userid: userid,
          name: name,
          productid: productid,
          days: days,
          unitprice: unitprice,
          username: username,
          image: image,
          total: total,
          fromdate: fromdate,
          todate : todate,
          ordertime: ordertime,
          checkout:0
        }, function(err, record){
            if (err) throw err;
            res.redirect('/cart/'+ userid );
        });
    });
  }else{
      redirect('/user/login');
  }
 });



//update /editcart/<%= cart[0].username

router.get('/editcart/:username/:id',function (req,res) {
    console.log("get",req.query.rentdays)
    db.get('cart').findOne({_id:req.params.id},function (err,item) {
         console.log("item is",item)
        console.log("item.unitprice is",item.unitprice)
        var unitprice = item.unitprice
        var total = unitprice*req.query.rentdays
        if(req.query.rentdays!=""){
            db.get('cart').findOneAndUpdate({_id : req.params.id},{$set:{
                    total:total,days:req.query.rentdays,
                }}).then((doc) =>{res.redirect('/cart/'+req.params.username)})
        }else{
            res.redirect('/cart/'+req.params.username)
        }

     });
    // db.get('cart').findOneAndUpdate({_id : req.params.id},{$set:{
    //         total:0,days:req.query.rentdays,
    //     }}).then((doc) =>{res.redirect('/cart/'+req.params.username)})


})

//checkout for user /checkout/fengmi
router.get('/checkout/:username',function (req,res) {
    db.get('cart').find({username:req.params.username},function (err,item) {
            for(var i=0;i<item.length;i++){
                if(item[i].checkout==0 ){
                    var item_id = item[i]._id;
                    console.log(item_id);
                    db.get('Rvs').update(
                       {  _id: item[i].productid },
                       { $inc:
                          {
                            stock: -1,
                          }
                       }
                    );
                    db.get('cart').findOneAndUpdate({_id : item_id},{$set:{
                            checkout:1,
                        }});
                    db.get('purchase').insert({
                        userid: item[i].userid,
                        productid: item[i]. productid,
                        name: item[i].name,
                        days:item[i].days,
                        unitprice:item[i].unitprice,
                        username: item[i].username,
                        image: item[i].image,
                        startdate: item[i].fromdate,
                        enddate: item[i].todate,
                        ordertime: item[i].ordertime,
                        total: item[i].total
                    });
                }
            }
    }).then((doc) =>{res.redirect('/purchase/'+req.params.username)});
});

// purchase history
router.get('/purchase/:username/', function(req, res) {

    db.get('purchase').find({username:req.params.username},function (err,record) {
        res.render('purchase',{record:record});
    });
});

//update cart /editcart/remove/

router.get('/editcart/remove/:username/:id',function (req,res) {
    db.get('cart').findOneAndUpdate({_id : req.params.id},{$set:{
            total:0,days:0
        }}).then((doc) =>{res.redirect('/cart/'+req.params.username)})
})


router.post('/forwardregister', function(req, res){
    var collection = db.get('accounts');
    collection.findOne({ username: req.body.username }, function(err, account){
        if (err) throw err;
        //res.send(account == null);
        if(account==null){
            const crypto = require('crypto');
            // console.log(crypto.createHash('sha1').update(req.body.password).digest('hex'))
            collection.insert({
                username: req.body.username,
                password: crypto.createHash('sha1').update(req.body.password).digest('hex'),
                email: req.body.email,
                isAdmin:0
            }, function(err, video){
                if (err) throw err;
                collection.findOne({ username: req.body.username }, function(err, account){
                    if (err) throw err;
                    //res.send(account == null);
                    var id =account.username
                    res.redirect('user/login');
                });
            });
        }else {// not null need to register again.
            res.render('newuser');
        }
    });

});
//checkpassword
router.post('/checkpassword', function(req, res){
    var collection = db.get('accounts');
    const crypto = require('crypto');

    collection.findOne({ username: req.body.username }, function(err, account){
        if (err) throw err;
        //res.send(account);
        if(account.password ==crypto.createHash('sha1').update(req.body.password).digest('hex')){ 
            req.session.userinfo = account;
            // res.redirect('/cart/'+req.body.username);
            res.redirect('/');
        }else{
            res.redirect('/user/login');
        }
    });
});
// new user

router.get('/user/new', function(req, res) {
    res.render('newuser');
});

router.get('/rent/:id',function(req,res){
  var collection = db.get('Rvs');
  collection.findOne({ _id: req.params.id}, function(err, Rv){
        if (err) throw err;
       res.render('rent', { Rv: Rv});
  });
});




router.get("/", function(req, res){

  var collection = db.get('Rvs');
  var page = Number(req.query.page || 1);
  var pages = 0;
  var limit = 6 ;
  var skip = (page-1) * limit;

  if(req.session.userinfo && req.session.userinfo.isAdmin){
    if(req.query.search && req.xhr) {
      if(req.query.type != "all"){
        const regex = new RegExp(req.query.search, 'gi');
        var type = new RegExp(req.query.type, 'gi');
        collection.count({make: regex, type: type},function(err,count){
          collection.find({make: regex, type: type},{limit: limit, skip : skip} ,function(err, Rvs){
             if(err){
                console.log(err);
             } else {
                pages= Math.ceil(count/limit);
                
                res.send({Rvs: Rvs, pages:pages});
             }
          });
        });
      }
      else if(req.query.type == "all"){
        const regex = new RegExp(req.query.search, 'gi');
        collection.count({make: regex},function(err,count){
          collection.find({make: regex},{limit: limit, skip : skip} ,function(err, Rvs){
             if(err){
                console.log(err);
             } else {
                pages= Math.ceil(count/limit);
                
                res.send({Rvs: Rvs, pages:pages});
             }
          });
        });
        
      }
  } 
  else if(req.query.search =="" && req.query.type != "all"){
      var type = new RegExp(req.query.type, 'gi');
      collection.count({type: type},function(err,count){
          collection.find({type: type},{limit: limit, skip : skip}, function(err, Rvs){
           if(err){
              console.log(err);
           } else {
              pages= Math.ceil(count/limit);
              
              res.send({Rvs: Rvs, pages:pages});
           }
        });
      });
  }
  else{
    collection.count({},function(err,count){
      collection.find({},{limit: limit, skip : skip}, function(err, Rvs){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              pages= Math.ceil(count/limit);
              
              res.send({Rvs: Rvs, pages:pages});
            } else {
              pages= Math.ceil(count/limit);
              
              res.render("index",{Rvs: Rvs,pages: pages, user: req.user});
            }
         }
      });
    });
    }
  }else{
    if(req.query.search && req.xhr) {
      if(req.query.type != "all"){
        const regex = new RegExp(req.query.search, 'gi');
        var type = new RegExp(req.query.type, 'gi');
        collection.count({make: regex, type: type, isdeleted: false},function(err,count){
          collection.find({make: regex, type: type,isdeleted: false},{limit: limit, skip : skip} ,function(err, Rvs){
             if(err){
                console.log(err);
             } else {
                pages= Math.ceil(count/limit);
                
                res.send({Rvs: Rvs, pages:pages});
             }
          });
        });
      }
      else if(req.query.type == "all"){
        const regex = new RegExp(req.query.search, 'gi');
        collection.count({make: regex,isdeleted: false},function(err,count){
          collection.find({make: regex,isdeleted: false},{limit: limit, skip : skip} ,function(err, Rvs){
             if(err){
                console.log(err);
             } else {
                pages= Math.ceil(count/limit);
                
                res.send({Rvs: Rvs, pages:pages});
             }
          });
        });
        
      }
  } 
  else if(req.query.search =="" && req.query.type != "all"){
      var type = new RegExp(req.query.type, 'gi');
      collection.count({type: type,isdeleted: false},function(err,count){
          collection.find({type: type,isdeleted: false},{limit: limit, skip : skip}, function(err, Rvs){
           if(err){
              console.log(err);
           } else {
              pages= Math.ceil(count/limit);
              
              res.send({Rvs: Rvs, pages:pages});
           }
        });
      });
  }
  else{
    collection.count({},function(err,count){
      collection.find({isdeleted: false},{limit: limit, skip : skip}, function(err, Rvs){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              pages= Math.ceil(count/limit);
              
              res.send({Rvs: Rvs, pages:pages});
            } else {
              pages= Math.ceil(count/limit);
              
              res.render("index",{Rvs: Rvs,pages: pages, user: req.user});
            }
         }
      });
    });
  }

  }

  
});

router.get('/user/login', function(req, res) {
    res.render('login');
});

router.get('/user/logout', function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    })
})

router.get('/cart/:id/', function(req, res) {
    db.get('cart').find({userid:req.params.id},function (err,cart) {
        var total=0;
        editcart =[];
        for(var i=0;i<cart.length;i++){
            if(cart[i].checkout!=1 && cart[i].days!=0 && cart[i].total!=0 ){
                editcart.push(cart[i]);
                total = Number(total)+Number(cart[i].total);
            }
        }
        res.render('cart',{cart:editcart,user:cart[0].username,subtotal:total})
    });
});

router.get('/cart/:name/:id', function(req, res) {
    db.get('cart').find({_id:req.params.id},function (err,cart) {
        res.render('cartedit',{cart:cart,user:req.params.name})
    });
});


router.get('/user/checkuser', function(req, res) {
    var collection = db.get('accounts');
    collection.findOne({ username: req.query.username }, function(err, account){
        if (err) throw err;
        res.send(account);
    });
});



router.get('/wishlist/:id', function(req, res) {
  var wl_db = db.get('wishlist');
  wl_db.find({userid : req.params.id}, function(err, foundUser) {
    if (err) {
        res.redirect("/");
    }
    res.render('wishlist', {foundUser : foundUser});
  });
});  



// Delete wishlist
router.delete('/wishlist/:id', function(req, res) {
    var collection = db.get('wishlist');
    var wlid = req.body.pid;
    var userid = req.params.id;
    console.log(userid);
    collection.remove({ _id: wlid }, function(err, wl){
       if (err) throw err;
       var url = '/wishlist/' +userid;
       res.redirect(url);
    });
  
});


router.get('/addwishlist/:id', function(req, res) {
  if (req.session.userinfo) {
      var rv_db = db.get('Rvs');
      var wl_db = db.get('wishlist');
      rv_db.findOne({ _id: req.params.id}, function(err, rv){
        if (err) throw err;
        wl_db.insert({
            rvid : rv._id,
            rvmodel : rv.model,
            rvmake : rv.make,
            rvyear : rv.year,
            userid : req.session.userinfo._id,
            username : req.session.userinfo.username
        }, function(err, wishlist) {
            if (err) throw err;
            var url = '/wishlist/' +req.session.userinfo._id;
            res.redirect(url);
        });
      });  
  }else{
    res.redirect('/');
  }
  
});

module.exports = router;
