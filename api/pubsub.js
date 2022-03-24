const PubNub = require('pubnub');

const credentials = {
    publishKey: 'pub-c-516cdbbf-6d0f-49aa-a13e-ddae1f945166',
    subscribeKey: 'sub-c-7c2fa8e2-ab02-11ec-ab7a-66fb1d4f8b52',
    uuid: 'test-uuid-01'
};

const CHANNELS_MAP = {
    TEST: 'TEST',
    BLOCK: 'BLOCK'
};

class PubSub {
    constructor() {
        this.pubnub = new PubNub(credentials);
        this.subscribeToChannels();
        this.listen();
    }

    subscribeToChannels() {
        this.pubnub.subscribe({
            channels: Object.values(CHANNELS_MAP)
        });
    }

    publish({ channel, message }) {
        this.pubnub.publish({ channel, message });
    }

    listen() {
        this.pubnub.addListener({
            message: messageObject => {
                console.log('messageObject', messageObject);
            }
        });
    }
}

module.exports = PubSub;

const pubsub = new PubSub();
setTimeout(() => {
    pubsub.publish({
        channel: CHANNELS_MAP.TEST,
        message: 'foo'
    });
}, 3000);
