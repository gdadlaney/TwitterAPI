// for environment configuration
const dotenv = require('dotenv');
dotenv.config(); //read the .env file and set all environment variables

//export all env variables from one file and require any wherever needed
module.exports = {
	SQL_USER: process.env.USER,
	SQL_PASS: process.env.PASSWORD,
	SQL_DB: process.env.DATABASE,

	ENV_PORT: process.env.PORT,
	//readable_variable_name: process.env.env_variable_name	
}