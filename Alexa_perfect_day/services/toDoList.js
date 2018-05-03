var https = require ('https');


var read = function (accessToken,callback){
    getAccessToken(accessToken,function(err,Id){
        if(err){
            console.log(err);
            callback(err,"fail")
        }else{
             getListItem(Id,accessToken,function(err,data){
                 if(err)
                 console.log(err)
                 else{
                 var items=[];
                     var j=0;
                     for(var i=0;i<data.items.length;i++){
                          items[j]=i+1;
                         j++;
                         items[j]=" , ";
                         j++;
                       items[j]=data.items[i].value;
                               j++;
                     }
                     console.log(items);
                     callback(null,items);
                 }
            });
             
        }
    });
};

function getListItem(Id,accessToken,cd){
      var  body;
      var amznProfileURL = 'https://api.amazonalexa.com/v2/householdlists/'+Id+"/active";
      

console.log("THE URL FOR READ OPRATION : ",amznProfileURL);  
          var optionspost = {
      host : 'api.amazonalexa.com',
      path : amznProfileURL,
      method : 'GET',
      headers: {
             'Content-Type': 'application/json',
             'authorization':"Bearer "+accessToken
         },
     };
    
     
   var reqPost = https.request(optionspost, function(res) {
           res.on('data', function (chunk) {
                 body += chunk;
         });
      res.on('end', function() {
        console.log(body);
     body=body.replace('undefined{','{');
        var data1=JSON.parse(body);
        
  cd (null,data1);
          });
     });

    // reqPost.write(jsonObject);
     reqPost.end();
     reqPost.on('error', (e) => {
     console.error(e);
 });
}

function writeToList(Id,accessToenk,valueTowrite){
     var body="";
      var jsonObject = JSON.stringify({
     "value":valueTowrite,
     "status":"active"
  });
   var amznProfileURL = 'https://api.amazonalexa.com/v2/householdlists/';
 amznProfileURL=amznProfileURL+Id+"/items";
 console.log("THE URL : ",amznProfileURL);

       var optionspost = {
       host :'api.amazonalexa.com',
       path : amznProfileURL,
       method : 'POST',
       headers: {
           'Content-Type': 'application/json',
              'authorization':"Bearer "+accessToenk
           },
      };
   var reqPost = https.request(optionspost, function(res) {
           res.on('data', function (chunk) {
              body += chunk;
          });
       res.on('end', function() {
           console.log("--------------data Inserted--------------------",body);
       // var data = JSON.parse(body);
           //console.log(data);
         //  var data=body;
        });
      });
      reqPost.write(jsonObject);
      reqPost.end();
      reqPost.on('error', (e) => {
      console.error(e);
  });
    
}

 function getAccessToken(accessToken,callback){  
     var amznProfileURL = 'https://api.amazonalexa.com/v2/householdlists/';
        console.log('-----It is the First function-----');
          var optionspost = {
      host : 'api.amazonalexa.com',
      path : amznProfileURL,
      method : 'GET',
      headers: {
             'Content-Type': 'application/json',
             'authorization':"Bearer "+accessToken
         },
     };
    var body;
     
   var reqGet = https.request(optionspost, function(res) {
           res.on('data', function (chunk) {
                 body += chunk;
         });
      res.on('end', function() {
        console.log(body);
     body=body.replace('undefined{','{');
        var data1=JSON.parse(body);
      console.log("LIST ID OF SHOPPING LIST : ",data1.lists[1]);
// console.log(data1.lists[1].value);
var shoppingListId=data1.lists[1].listId;
 console.log('Shoppinglist ID :',shoppingListId);
 callback(null,shoppingListId);
           });
});
 
    reqGet.end();
     reqGet.on('error', (e) => {
     console.error(e);
 });
}

var write = function (accessToenk,valueTowrite,callback){
        getAccessToken(accessToenk,function(err,Id){
        if(err){
            console.log(err);
            callback(err,"fail");
        }else{
             writeToList(Id,accessToenk,valueTowrite);
             callback(null,"sucess");
        }
    });
};
    
module.exports.read = read;
module.exports.write = write;