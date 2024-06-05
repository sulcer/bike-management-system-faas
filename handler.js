'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const docClient = new AWS.DynamoDB.DocumentClient({
    endpoint: 'http://localhost:4566', // Localstack DynamoDB endpoint
    region: 'us-east-1'
});

const TABLE_NAME = "bike-management-system-bikes";

const JWT_SECRET = "secret";

// Middleware to validate JWT
const authenticateJWT = (event) => {
    const token = event.headers.Authorization || event.headers.authorization;
    if (!token) {
        throw new Error('No token provided');
    }
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Unauthorized');
    }
};

// Login
module.exports.login = async (event) => {
    const {username, password} = JSON.parse(event.body);
    if (username === 'admin' && password === 'admin') {
        return {
            statusCode: 200,
            body: JSON.stringify({
                token: jwt.sign({username}, JWT_SECRET)
            })
        };
    }

    return {
        statusCode: 401,
        body: JSON.stringify({error: 'Unauthorized'})
    };
};

module.exports.createBike = async (event) => {
    const {location, available, stars} = JSON.parse(event.body);
    const id = uuid.v4();
    const newBike = {id, location, available, stars};
    await docClient.put({
        TableName: TABLE_NAME,
        Item: newBike
    }).promise();

    // Auto-invoking function
    await module.exports.sendBikesSummary(event);

    return {
        statusCode: 201,
        body: JSON.stringify(newBike)
    };
};
//
// Get All Bikes
module.exports.getBikes = async () => {
    const data = await docClient.scan({TableName: TABLE_NAME}).promise();
    return {
        statusCode: 200,
        body: JSON.stringify(data.Items)
    };
};

// Get Bike by ID
module.exports.getBikeById = async (event) => {
    const {id} = event.pathParameters;
    const data = await docClient.get({
        TableName: TABLE_NAME,
        Key: {id}
    }).promise();
    if (!data.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({error: 'Bike not found'})
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify(data.Item)
    };
};

// Update Bike
module.exports.updateBike = async (event) => {
    const {id} = event.pathParameters;
    const {location, available, stars} = JSON.parse(event.body);
    await docClient.update({
        TableName: TABLE_NAME,
        Key: {id},
        UpdateExpression: 'set location = :location, available = :available, stars = :stars',
        ExpressionAttributeValues: {
            ':location': location,
            ':available': available,
            ':stars': stars
        }
    }).promise();
    return {
        statusCode: 200,
        body: JSON.stringify({id, location, available, stars})
    };
};

// Delete Bike
module.exports.deleteBike = async (event) => {
    const {id} = event.pathParameters;
    await docClient.delete({
        TableName: TABLE_NAME,
        Key: {id}
    }).promise();
    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Bike deleted successfully'})
    };
};

module.exports.scheduledTask = async () => {
    console.log('Scheduled task running...');
};

module.exports.processBikeChanges = async (event) => {
    for (const record of event.Records) {
        console.log('DynamoDB Record: %j', record.dynamodb);
    }
};

module.exports.sendBikesSummary = async (event) => {
    // get all cars
    const data = await docClient.scan({TableName: TABLE_NAME}).promise();
    const bikes = data.Items;

    return {
        statusCode: 200,
        body: JSON.stringify({bikes: bikes})
    };
};

// Handle SNS Notification
module.exports.handleSnsNotification = async (event) => {
    for (const record of event.Records) {
        const snsMessage = record.Sns.Message;
        console.log('SNS Message:', snsMessage);
    }
    return {
        statusCode: 200,
        body: JSON.stringify({message: 'SNS notification processed successfully'})
    };
};