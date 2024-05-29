'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient({
    endpoint: 'http://localhost:4566', // Localstack DynamoDB endpoint
    region: 'us-east-1'
});

const TABLE_NAME = "bike-management-system-bikes";

module.exports.createBike = async (event) => {
    const {location, available, stars} = JSON.parse(event.body);
    const id = uuid.v4();
    const newBike = {id, location, available, stars};
    await docClient.put({
        TableName: TABLE_NAME,
        Item: newBike
    }).promise();
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