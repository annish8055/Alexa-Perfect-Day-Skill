const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});
var nodemailer = require('nodemailer');


var smail = function(email){
      var params={
        Key:{
            "email":email
        },
        TableName:'SendStretchMail'
    };
    docClient.get(params, function(err, data){
        if(err){
        console.log(err);
         }
        else{
            console.log("-------------------------------------------------------",data);
            if(data.Item == undefined){
            
                insertData(email);
                sendMailFun(email);
            }
         }
        
    });
   
};

function sendMailFun(email){
    /*--------------send the mail------------*/
}
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'youremail@gmail.com',
      pass: 'yourpassword'
    }
  });
  
  var mailOptions = {
    from: 'youremail@gmail.com',
    to: 'myfriend@yahoo.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

function insertData(email){
    var params={
        Item:{
              "email":email,
              "state":"sent"
        },
        TableName:'SendStretchMail'
   };
    docClient.put(params, function(err, data){
        if(err)
       console.log(err);
        else
        console.log("success");
    });
}

module.exports.smail = smail;