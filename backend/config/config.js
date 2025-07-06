require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mssql", // <--- CAMBIAR AQUÍ a mssql para SQL Server
    port: process.env.DB_PORT || 1433, // <--- AÑADIR PUERTO, por defecto 1433
    dialectOptions: { // <--- AÑADIR OPCIONES ESPECÍFICAS PARA AZURE SQL
      encrypt: true, // Usa cifrado SSL/TLS
      trustServerCertificate: false // Para certificados de Azure SQL (true para autofirmados)
    }
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + "_test",
    host: process.env.DB_HOST,
    dialect: "mssql", // <--- CAMBIAR AQUÍ
    port: process.env.DB_PORT || 1433, // <--- AÑADIR PUERTO
    dialectOptions: { 
      encrypt: true,
      trustServerCertificate: false
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + "_prod",
    host: process.env.DB_HOST,
    dialect: "mssql", // <--- CAMBIAR AQUÍ
    port: process.env.DB_PORT || 1433, // <--- AÑADIR PUERTO
    dialectOptions: { 
      encrypt: true,
      trustServerCertificate: false
    }
  }
};