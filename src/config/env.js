require("dotenv").config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  firebird: {
    host: process.env.FDB_HOST,
    port: process.env.FDB_PORT,
    database: process.env.FDB_DATABASE,
    user: process.env.FDB_USER,
    password: process.env.FDB_PASSWORD,
  },
};

module.exports = config;
