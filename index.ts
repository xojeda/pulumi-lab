import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as mysql from "@pulumi/mysql";

const config = new pulumi.Config();
const mysqlUser = config.require('mysqlUser');
const mysqlPassword = config.requireSecret('mysqlPassword');

const rds = new aws.rds.Instance('baitedsql', {
  engine: 'mysql',
  username: mysqlUser,
  password: mysqlPassword,
  availabilityZone: 'us-east-1b',
  instanceClass: 'db.t2.micro',
  allocatedStorage: 20,
  deletionProtection: true,
});

const mysqlProvider = new mysql.Provider('baitedsql',{
  endpoint: rds.endpoint,
  username: rds.username,
  password: rds.password.toString(),
});

const database = new mysql.Database('baited', {
  name: 'baited-sql',
}, {
  provider: mysqlProvider
});

const user = new mysql.User('serverless', {
  user: "serverless",
  host: "*",
  plaintextPassword: "6eE8gosAZbdaqCpsYGnm23",
}, {
  provider: mysqlProvider
});

new mysql.Grant('serverless', {
  user: user.user,
  host: user.host.toString(),
  database: database.name,
  privileges: ["SELECT", "UPDATE"],
}, {
  provider: mysqlProvider
});