var https = require('https');
var sendName = function(accessToken,cb){
    var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
    var body;
        amznProfileURL += accessToken;
          var optionspost = {
      host : 'api.amazon.com',
      path : amznProfileURL,
      method : 'GET',
      headers: {
             'Content-Type': 'application/json',
         },
     };
    
   var reqGet = https.request(optionspost, function(res) {
           res.on('data', function (chunk) {
                 body += chunk;
         });
      res.on('end', function() {
                  console.log("--------------Profie-----------",body);
                  
     body=body.replace('undefined{','{');
        var data1=JSON.parse(body);
                  cb(null,data1);
          });
     });

     reqGet.end();
     reqGet.on('error', (e) => {
     console.error(e);
 }); 
   

};

module.exports.sendName = sendName;