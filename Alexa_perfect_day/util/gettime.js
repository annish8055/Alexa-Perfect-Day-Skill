var returnTime = function(time,callback){
    console.log("-------------------In find mor aft nig function---------------------")
    var timeofTheDay = "morning";
    var actualTime = time.split("T");
    var daymovment = actualTime[1].split(':');
   if(daymovment[0]<12 && daymovment[0]>=0){
        timeofTheDay="morning";
        callback(null,timeofTheDay);
    }
    if(daymovment[0]>=12 && daymovment[0]<19){
        timeofTheDay="afternoon";
        callback(null,timeofTheDay);
    }
    if(daymovment[0]>=19 && daymovment[0]<=24){
       timeofTheDay="evening"; 
       callback(null,timeofTheDay);
    }
    
};

module.exports.returnTime = returnTime ;