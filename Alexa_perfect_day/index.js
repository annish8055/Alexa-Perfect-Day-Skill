'use strict';
var https = require ('https');
var alexaResponse = require ('resources/alexa_responses');
var motivation = require ('resources/Motivational_data');
var dso = require ('dao/dbQuery');
var stretch = require ('services/stretch');
var thoughtoftheDay = require ('services/thoughtoftheDay');
var todo = require ('services/toDoList');
var util = require('util/gettime');
var getName = require ('util/getName');
var gname = require ('resources/generalNames');
var stretch= require ('resources/stretch_instuction');
var sendMail = require ('util/sendMail');

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title,text, output, repromptText, img, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'SSML',
            ssml: output,
        },
        card: {
      "type": "Standard",
      "title": title,
      "text": text,
      "image": {
        "smallImageUrl": img,
        "largeImageUrl": img
      }
    },
        reprompt: {
            outputSpeech: {
                type: 'SSML',
                ssml: repromptText,
            },
        },
        shouldEndSession,
    };
}
function buildSpeechletResponseCA(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'SSML',
            ssml: output,
        },
         "card": {
      "type": "AskForPermissionsConsent",
       "permissions": [
        "read::alexa:household:list",
		   "write::alexa:household:list" 
      ]
     },
        reprompt: {
            outputSpeech: {
                type: 'SSML',
                ssml: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildSpeechletResponseAccountLink(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'SSML',
            ssml: output,
        },
          card: {
          type: "LinkAccount"
        },
        reprompt: {
            outputSpeech: {
                type: 'SSML',
                ssml: repromptText,
            },
        },
        shouldEndSession,
    };
}
    

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

 function getWelcomeResponse(launchRequest,callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    const cardTitle = 'Welcome';
     var speechOutput;
    var repromptText ;
    var name;
    var text;
    console.log("-------------------in welcome function--------------------");
    util.returnTime(launchRequest.request.timestamp, function(err,result){
        if(err){
        console.log("---------------ERRRRRRROR-----------------",err);
         getErrorOrWrite(launchRequest, null, callback);
        }
        else{
            //will write a function to get the name of the user
            console.log("==============>",result);
    dso.getUserCount(launchRequest.context.System.user.userId,launchRequest.request.timestamp,function(error, count){
	    	console.log("==============>",count);
	    if(error){
	    console.log(error);
	    getErrorOrWrite(launchRequest, null, callback);
	    }
	    else{
	    
	    	if(count == '0'){
	    	    if(result === 'morning'){
	    	        sessionAttributes = {context:"Stretch"};
	    	         speechOutput = '<speak>'+alexaResponse.responses.welcomeMorningFirst+'</speak>';
                
	    	    }
	    	    if(result === 'afternoon'){
	    	        sessionAttributes = {context:"Stretch"};
	    	        speechOutput = '<speak>'+alexaResponse.responses.welcomeAfternoonFirst+'</speak>';
	    	    }
	    	    if(result === 'evening'){
	    	        sessionAttributes = {context:"Stretch"};
	    	        speechOutput = '<speak>'+alexaResponse.responses.welcomeNightFirst+'</speak>';
	    	    }
	    	   
	    	}else{
	    	      if(result === 'morning'){
	    	         speechOutput = '<speak>'+alexaResponse.responses.welcomeMorningSecond+'</speak>';
                
	    	    }
	    	    if(result === 'afternoon'){
	    	        speechOutput = '<speak>'+alexaResponse.responses.welcomeAfternoonSecond+'</speak>';
	    	    }
	    	    if(result === 'evening'){
	    	        speechOutput = '<speak>'+alexaResponse.responses.welcomeNightSecond+'</speak>';
	    	    }
	    	}
	    	   if(launchRequest.session.user.accessToken == undefined){
        name = gname.names[Math.round(Math.random() * ((gname.names.length - 1) - 0) + 0)];
        console.log("---------------Name-----------------",name);
        
	    	speechOutput=speechOutput.replace("<name>",name);
	    	speechOutput=speechOutput.replace("<a>","For better experience complete the account linking process , a card has been sent in companion app. Now, ");
    repromptText = speechOutput;
    const shouldEndSession = false;
     callback(sessionAttributes,
        buildSpeechletResponseAccountLink(cardTitle, speechOutput, repromptText, shouldEndSession));
    }else{
        /*check in db and send the mail*/
    getName.sendName(launchRequest.session.user.accessToken,function(err,res){
        if(err){
            console.log(err);
            getErrorOrWrite(launchRequest, null, callback);
        }else{
            name = res.name;
            if(res.email!==undefined){
                 sendMail.smail(res.email);
             }
            if(name === undefined){
                name = gname.names[Math.round(Math.random() * ((gname.names.length - 1) - 0) + 0)];
            }
            console.log("=============Got name=============",name);
            var name1 = name.split(" ");
             var quoteNumber = Math.round(Math.random() * ((motivation.length - 1) - 0) + 0);
             var moti = motivation[quoteNumber].quoteText+" <break time=\"0.5s\"/> by <break time=\"0.5s\"/> "+motivation[quoteNumber].quoteAuthor;      
	    	speechOutput=speechOutput.replace("<name>",name1[0]);
	    	speechOutput=speechOutput.replace("<thought>",moti);
	    	speechOutput=speechOutput.replace("<a>","");
	    	text = motivation[quoteNumber].quoteText+" by "+motivation[quoteNumber].quoteAuthor;  
    repromptText = speechOutput;
    const shouldEndSession = false;
    var img = null; //image link
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text,speechOutput, repromptText, img, shouldEndSession));
        }
        
    });
    console.log(name);
    }
 
	    }
	});
        }
    });
    


}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = '<speak>'+alexaResponse.responses.good_bye+'</speak>';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;
    var text = alexaResponse.responses.good_bye;

    callback({}, buildSpeechletResponse(cardTitle,text, speechOutput, null,null, shouldEndSession));
}

function getHelpResponse(req, session, callback){
     const sessionAttributes = {};
    const cardTitle = 'Help';
    const speechOutput = '<speak>'+alexaResponse.responses.help+'</speak>';
    const repromptText = speechOutput;
    const shouldEndSession = false;
    var img = null; //image link
    var text = alexaResponse.responses.help;
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
}
//------------------------FUNCTION------------------------------
function getMoti(req, session, callback){
    var sessionAttributes = {};
     const cardTitle = 'Motivational Thought';
     var quoteNumber = Math.round(Math.random() * ((motivation.length - 1) - 0) + 0);
    const speechOutput = '<speak>'+motivation[quoteNumber].quoteText+" <break time=\"0.5s\"/> by <break time=\"0.5s\"/> "+motivation[quoteNumber].quoteAuthor+', select from stretch or to do list or say stop to stop the skill </speak>';
    const repromptText = speechOutput;
    const shouldEndSession = false;
    var img = null; //image link
    var text = motivation[quoteNumber].quoteText+" by "+motivation[quoteNumber].quoteAuthor;
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
   // thoughtoftheDay.getMotivation(req, session, callback);
    
}

function getToDo(req, session, callback){
     var sessionAttributes = {};
     const cardTitle = 'To Do';
     var speechOutput;
      var repromptText;
      var img;
      var text="";
       var shouldEndSession = false;
       if(session.user.permissions!= undefined){
            var accessToenk = session.user.permissions.consentToken;
    // console.log("--------------------------------",req)
     var operation = req.request.intent.slots.operation.value;
     if(operation === "write" ||  operation === "right"){
         sessionAttributes={conext:"write"};
     speechOutput = '<speak>'+"Tell me what you want me to write to your to do list"+'</speak>';
     repromptText = speechOutput;
        img = null; //image link
         text = "Tell me what you want me to write to your to do list";
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
       }else{
        todo.read(accessToenk,function(err,res){
            if(err){
                console.log(err);
                getErrorOrWrite(req, null, callback);
            }
            else{
                 console.log("=============================",res);
                
                 for(var i=0;i<res.length;i++){
                     text=text+" "+res[i]+" ";
                 }
               speechOutput = '<speak> your to do list have these active items '+res+' , <break time=\"2s\"/>  to write on to do list say write to do list, or you select from motivation or stretch </speak>';
                   repromptText = speechOutput;
        img = null; //image link
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
      
            }
        });
        
     }
    
       }else{
             speechOutput = '<speak>'+alexaResponse.responses.noaccess+'</speak>';
     repromptText = speechOutput;
     shouldEndSession = true;
    callback(sessionAttributes,
        buildSpeechletResponseCA(cardTitle, speechOutput, repromptText, shouldEndSession));
    thoughtoftheDay.getMotivation(req, session, callback);
   
       }
    
    
}//todo

function  getErrorOrWrite(req, session, callback){
     var speechOutput;
     var repromptText;
     var cardTitle;
     var img;
     var text;
   if(session!= null && session.attributes != undefined && (session.attributes.conext==="write" || session.attributes.conext==="right") ){
    var valueTowrite = req.request.intent.slots.somethingElse.value ;
    var accessToenk = session.user.permissions.consentToken;
    console.log("==============>",valueTowrite);
     cardTitle = 'Writen To-Do List';
     todo.write(accessToenk,valueTowrite, function(err,result){
         if(err)
         console.log(err);
         else{
             console.log("Success");
         }
     });
     
     cardTitle = "Written on TO-DO list";
     text=valueTowrite;
     speechOutput = '<speak>'+valueTowrite+' has been added to your to do list ,  <break time=\"1s\"/> you can say read my to do list to listen to your to do list</speak>';
     repromptText = speechOutput;
    const shouldEndSession = false;
     img = null; //image link
    callback(null,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
   }else{
         var sessionAttributes = {};
     cardTitle = 'Confused';
     speechOutput = '<speak>'+alexaResponse.responses.error+'</speak>';
     text=alexaResponse.responses.error;
     repromptText = speechOutput;
    const shouldEndSession = false;
     img = null; //image link
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
   }
    
}
/*
Function to get stretching response
*/
function getStretch(req, session, callback){
      var speechOutput;
     var repromptText;
     var cardTitle = "Stretch";
     var img;
     var sessionAttributes={}; 
     var shouldEndSession;
     var link;
     var text;
     util.returnTime(req.request.timestamp, function(err,result){
        if(err){
        console.log("---------------ERRRRRRROR-----------------",err);
        getErrorOrWrite(req, session, callback);
        }
        else{
             if(result === 'morning'){
	    	         speechOutput = '<speak>'+stretch.stretch.morning.text+'</speak>';
                     link = stretch.stretch.morning.link;
	    	    }
	    	    if(result === 'afternoon'){
	    	       speechOutput = '<speak>'+stretch.stretch.morning.text+'</speak>';
                     link = stretch.stretch.morning.link;
	    	    }
	    	    if(result === 'evening'){
	    	        speechOutput = '<speak>'+stretch.stretch.morning.text+'</speak>';
                     link = stretch.stretch.morning.link;
	    	   }
	    	   
	    	  // cardTitle = cardTitle+link;
	    	   img = link;
	    	   text = "Follow throught you can do this";
	    	    shouldEndSession=true;
	    	    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
 
        }
   
});
}

function getYesResponse(req, session, callback){
      var speechOutput;
     var repromptText;
     var cardTitle;
     var img;
     var text;
     console.log("----------------In yes response--------------------");
     if(session.attributes != undefined && session.attributes.context==="Stretch"){
   console.log("---------------------yes response stretch-------------------------");
          getStretch(req, session, callback);
     }   else{
         var sessionAttributes = {};
     cardTitle = 'Confused';
     speechOutput = '<speak>'+alexaResponse.responses.error+'</speak>';
     repromptText = speechOutput;
     text= alexaResponse.responses.error;
    const shouldEndSession = false;
     img = null; //image link
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
   }
}

function getNoResponse(req, session, callback){
       var speechOutput;
     var repromptText;
     var cardTitle;
     var img;
     var text;
     var sessionAttributes = {};
     if(session.attributes != undefined && session.attributes.context==="Stretch"){
          
     cardTitle = 'Call me again';
     speechOutput = '<speak>Ok you can call me when ever you want to do the stretch, or get motivation, or read or write to your to do list or, say stop to stop the skill</speak>';
     text="Ok you can call me when ever you want to do the stretch, or get motivation, or read or write to your to do list or, say stop to stop the skill";
     repromptText = speechOutput;
    const shouldEndSession = false;
     img = null; //image link
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
       }   else{
           cardTitle = 'Confused';
     speechOutput = '<speak>'+alexaResponse.responses.error+'</speak>';
     repromptText = speechOutput;
     text=alexaResponse.responses.error;
    const shouldEndSession = false;
     img = null; //image link
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle,text, speechOutput, repromptText, img, shouldEndSession));
   }
}

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);
    // Dispatch to your skill's launch.
    getWelcomeResponse(launchRequest,callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(req, session, callback) {
    console.log(`onIntent requestId=${req.request.requestId}, sessionId=${session.sessionId}`);

    const intent = req.request.intent;
    const intentName = req.request.intent.name;


    // Dispatch to your skill's intent handlers
    if (intentName === 'motivation') {
	   getMoti(req, session, callback);
    }else if (intentName === 'todo') {
		/*will acess the to do list of the Alexa app
		can have read or write options*/
      getToDo(req, session, callback);
    }else if (intentName === 'stretch') {
		/*will give the stretching instruction which will come from the JSON*/
      getStretch(req, session, callback);
    }else if (intentName === 'Somrthing') {
       getErrorOrWrite(req, session, callback);
    } else if (intentName === 'AMAZON.YesIntent') {
       getYesResponse(req, session, callback);
    }else if (intentName === 'AMAZON.NoIntent') {
       getNoResponse(req, session, callback);
    }else if (intentName === 'AMAZON.HelpIntent') {   
        getHelpResponse(req, session, callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
    
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

console.log("---------event------------------",event)
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.ask.skill.73902b0f-1de3-4e91-95c4-d94b32d5eb19') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            
            onSessionStarted({ requestId: event.request.requestId }, event.session);
            
        }

        if (event.request.type === 'LaunchRequest') {
            console.log("------------------launch request-----------------------")
            onLaunch(event,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
