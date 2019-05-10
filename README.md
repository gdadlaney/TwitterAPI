# Twitter Demo API
My interpretation of the Twitter REST API created using Node.js(Express framework) and MySQL

# Features offered by API

## Basic Features
* User registration with unique username and password. Password hashing done.
* User login
* Session based user authentication
* User logout

## Core Features
* Create a tweet
* Read self posted tweets

# Getting Started

## Dependencies
* Node.js and npm
* MySQL-server on ubuntu (preferrably MariaDB)

## Installing the app
1. Ensure the availability of these 3 files
    - package.json
    - package-lock.json
    - twitterAPI.sql

2. Install all required dependencies as follows:
    ```bash
    npm install
    ```

3. Import Database
    1. Create database in mysql with the name as 'twitterAPI'
    2. Import the twitterAPI.sql file into mysql as follows:
        ```bash
        mysql twitterAPI < twitterAPI.sql
        ```

## Running the Server

1. Starting the server:<br>
    The following command can be used to start the server:
    ```bash
    node app.js
    ```

# API Endpoint Descriptions:

## User Registration:
### <b>POST: http://localhost:5000/register</b>
<b> Note: The fields in Request Body must be send via x-www-form-urlencoded or json data </b><br>
Request body:
```javascript
{
    "username": "gaurav",
    "password": "gaurav97"
}
```
Response body:
```javascript
{
    "registration_successful": true,
    "username": "gaurav"
}
```
#### Cases Handled
- Username already exists
- username & password validation
    - minimum length
    - Both fields must be present

## User Login:
### <b>POST: http://localhost:5000/login</b>
Request body:
```javascript
{
    "username": "gaurav",
    "password": "gaurav97"
}
```

Response body:
```javascript
{
    "login_successful": true,
    "username": "gaurav"
}
```
#### Cases Handled
- Username doesn't match
- Password doesn't match
- same username & password validation as done in /register
- logout before logging in as another user

## User Logout:
### <b>POST: http://localhost:5000/logout</b>
Request body is empty:<br>
Response body:
```javascript
{
    "success": true,
    "message": "logged out"
}
```
#### Cases Handled
- User not already logged in

## Posting a tweet:
### <b>POST: http://localhost:5000/tweet</b>
Request body:
```bash
{
    "tweet_data": "My first tweet"
}
```
Response body:
```javascript
{
    "username": "gaurav",
    "tweet_id": 5,
    "tweet_data": "My first tweet"
}
```
#### Cases Handled
- User must be logged in

## Read self posted tweets:
### <b>GET: http://localhost:5000/tweets</b>
Request body is empty:<br>
Response body:
```javascript
[
    {
        "tweet_id": 5,
        "tweet_data": "My first tweet"
    },
    {
        "tweet_id": 6,
        "tweet_data": "My second tweet"
    }
]
```
#### Cases Handled
- User must be logged in