const mongoose = require("mongoose");

const mongoDBTestUrl = 'mongodb+srv://sgdecodingtest:sgdecodingtest@cluster0.d67f63o.mongodb.net/test';

module.exports = {
    mongoose,
    connect: () => {
        mongoose.Promise = Promise;
        mongoose.connect(mongoDBTestUrl, function(){
            mongoose.connection.db.dropDatabase();
        });
    },

    disconnect: done => {
        mongoose.disconnect(done);
    }
}

