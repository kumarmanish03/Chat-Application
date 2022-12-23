const moment = require('moment');

function forwardMessage(username, text){
    return {
        username,
        text,
        time: moment().format('h:mm a')
    };
}

module.exports = forwardMessage;