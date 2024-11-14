const axios = require('axios');

const sendDiscordMessage = async (message) => {
    try {
        console.log('Sending message to Discord:', message);
        await axios.post('http://localhost:3001/send-message', { message });
        console.log('Message sent to Discord:', message);
    } catch (error) {
        console.error('Failed to send message to Discord:', error);
    }
};

module.exports = sendDiscordMessage;
