/*
* Create and export configuration variables
*
*/

var environments = {};

// Staging (default) environments 80 443
environments.staging ={
  'httpPort' : 3000,
  'envName' : 'staging',
  'httpsPort': 3001

};

environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production'

};
// Determine which env was passed on command line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;
