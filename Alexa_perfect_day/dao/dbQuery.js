const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region:'us-east-1'});


var getUserCount = function(userID,date,callback){
    var count='0';
    var aDate=date.split("T");
     var params={
        Key:{
            "usedID":userID
        },
        TableName:'UsercallCount'
    };
    docClient.get(params, function(err, data){
        if(err){
        console.log(err);
        callback(null,count);
        }
        else{
            console.log("-------------------------------------------------------",data);
            if(data.Item == undefined){
                insertData(userID ,aDate[0], function(error, result){
                    if(error)
                    callback(count);
                    else{
                        if(result == "success"){
                            console.log("Data inserted");
                           callback(null,'0'); 
                        }else{
                            console.log("Data insertion failed");
                          callback(null,'0');   
                        }
                    }
                });
            }else{
            console.log("-------------------",data.Item.Count);
            if(data.Item.Date!== aDate[0]){
                 insertDataon(userID ,aDate[0],'1');
                 callback(null,'0');  
            }else{
                if(data.Item.Count === '0'){
                    insertDataon(userID ,aDate[0],'1');
                }
                  count=data.Item.Count;
                  callback(null,count);
            }
        
            }
         }
        
    });
    
};

function insertData(userID,aDate,cb){
    console.log("===========data insertion happening========",userID);
     var params={
        Item:{
              "usedID":userID,
              "Count":'1',
              "Date":aDate
        },
        TableName:'UsercallCount'
   };
    docClient.put(params, function(err, data){
        if(err)
       cb(err,"failed");
        else
        cb(null,"success");
    });
}

function insertDataon(userID ,aDate,count){
      var params={
        Item:{
              "usedID":userID,
              "Count":count,
              "Date":aDate
        },
        TableName:'UsercallCount'
   };
    docClient.put(params, function(err, data){
        if(err)
       console.log(err);
        else
        console.log("success");
    });
}

module.exports.getUserCount = getUserCount;