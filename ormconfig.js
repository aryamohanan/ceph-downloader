const testDb = {
  type: "sqlite",
  name: 'default',
  database: ":memory:",
  dropSchema: true,
  synchronize: true,
  "entities": ['.lib/models/!(*.spec)*.ts'],
  logging: false
} 
const defaultDb = {
   name: 'default',
  "type": 'postgres',
  "host": process.env.postgresContactPoint,
  "port": process.env.postgresPort,
  "schema": process.env.postgresSchema,
  "database": process.env.postgresDatabase,
  "username": process.env.postgresDbUserName,
  "password": process.env.postgresDbPassword,
  "logging": false,
  "entities": ['.lib/models/!(*.spec)*.ts','./lib/models/RequestsFileUploadDetails.ts','./lib/models/Requests.ts','./lib/models/RequestSubscription.ts','./lib/models/RequestSubscriptionValidationDetails.ts']
}
const selectedDb = process.env.NODE_ENV == 'test' ? testDb : defaultDb;
module.exports = selectedDb;

