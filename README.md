# 🚴‍♂️ Bike Management System - Serverless

This project demonstrates how to develop a serverless backend for a bike management system using AWS Lambda, DynamoDB, and S3 with the Serverless Framework. The backend is developed and tested locally using Localstack.

## 🚀 Project Setup

### Step 1: Install Node.js and Serverless Framework

Ensure you have Node.js installed. Then, install the Serverless Framework globally:

```console
npm install -g serverless
```

### Step 2: Create a Serverless Project

Create a new Serverless project:

```console
serverless create --template aws-nodejs --path bike-management-system
cd bike-management-system
npm init -y
npm install aws-sdk serverless-offline serverless-localstack
```

## ⚙️ Configuration

### Step 3: Configure `serverless.yml`

Update your `serverless.yml` to configure DynamoDB and S3 locally using Localstack, and include serverless-offline for local API Gateway.

See the full `serverless.yml` configuration [here](serverless.yml).

## 📝 Lambda Functions

### Step 4: Create Lambda Functions

Create a `handler.js` file with the Lambda functions to handle the API endpoints. You can find the implementation details [here](handler.js).

## 🛠 Local Development

### Step 5: Start Localstack

Start Localstack:

```console
localstack start
```

Create DynamoDB Table and S3 Bucket Locally:

```bash
aws --endpoint-url=http://localhost:4566 dynamodb create-table --table-name bike-management-system-bikes --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --region us-east-1

aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket bike-management-system-uploads --region us-east-1
```

### Step 6: Start Serverless Offline

Start the Serverless Offline plugin to run the API locally:

```console
serverless offline --stage local
```

### Step 7: Test Locally

Use Postman or curl to test the endpoints locally:

#### 🚴‍♂️ Create Bike:

```bash
curl -X POST http://localhost:3000/local/bikes -H "Content-Type: application/json" -d '{"location":"Central Park","available":true,"stars":4}'
```

#### 📋 Get All Bikes:

```bash
curl http://localhost:3000/local/bikes
```

#### 🔍 Get Bike by ID:

```bash
curl http://localhost:3000/local/bikes/{id}
```

#### ✏️ Update Bike:

```bash
curl -X PUT http://localhost:3000/local/bikes/{id} -H "Content-Type: application/json" -d '{"location":"Downtown","available":false,"stars":5}'
```

#### ❌ Delete Bike:

```bash
curl -X DELETE http://localhost:3000/local/bikes/{id}
```
