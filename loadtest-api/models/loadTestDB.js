const mongoose = require('mongoose');

const loadTestDBSchema = new mongoose.Schema({
    test_folder: {
        type: String
    },
    testName: {
        type: String,
        required: true,
        immutable: true
    },
    createdBy: {
        type: String,
        required: true,
        immutable: true
    },
    rps: {
        type: String,
        required: true
    },
    users: {
        type: String,
        required: true
    }, 
    time: {
        type: String,
        required: true
    },
    env:{
        type: String,
        required: true
    },
    langFeature:{
        type: String,
        required: true
    },
    input:{
        type: String,
        required: true
    },
    customFile:{
        data: Buffer,
        contentType: { type: String, default: 'application/json'}
    },
    status:{
        type: String,
        enum: ['In queue', 'Running', 'Completed', 'Error'],
        default: 'In queue'
    },
    progress:{
        type: Number,
        default: 0
    },
    runAt: {
        type:Date,
        default: Date.now
    },
    error:{
        type:String,
        default: "NO"
    },
    testResults:{
        numberOfRequests : {
            total: String,
            ok: String,
            ko: String
        },
        minResponseTime : {
            total: String,
            ok: String,
            ko: String
        },
        maxResponseTime : {
            total: String,
            ok: String,
            ko: String
        },
        meanResponseTime : {
            total: String,
            ok: String,
            ko: String
        },
        standardDeviation : {
            total: String,
            ok: String,
            ko: String
        },
        meanNumberOfRequestsPerSecond : {
            total: String,
            ok: String,
            ko: String
        },
        
        p50: {
            total: String,
            ok: String,
            ko: String
        },
        p75: {
            total: String,
            ok: String,
            ko: String
        },
        p95: {
            total: String,
            ok: String,
            ko: String
        },
        p99: {
            total: String,
            ok: String,
            ko: String
        },

        group1: {
            name: {type: String, default: "t < 200 ms"},
            count: String,
            percentage: String
        },
        group2: {
            name: {type: String, default: "200 ms < t < 1000 ms"},
            count: String,
            percentage: String
        },
        group3: {
            name: {type: String, default: "t > 1000 ms"},
            count: String,
            percentage: String
        },
        group4: {
            name: {type: String, default: "failed"},
            count: String,
            percentage: String
        }
        
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('loadtestdb', loadTestDBSchema);