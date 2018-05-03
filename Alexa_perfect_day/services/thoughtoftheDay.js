var motivation = require ('resources/Motivational_data');

var getMotivation = function(req, session, callback){
      const sessionAttributes = {};
    const cardTitle = 'Help';
    const speechOutput = '<speak>'+motivation.responses.help+'</speak>';
    const repromptText = speechOutput;
    const shouldEndSession = false;
    var img = null; //image link
    //callback(sessionAttributes,
   //     buildSpeechletResponse(cardTitle, speechOutput, repromptText, img, shouldEndSession));
};

module.exports.getMotivation = getMotivation ;