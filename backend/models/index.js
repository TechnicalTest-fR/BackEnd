// models/index.js
'use strict';
require('dotenv').config(); 

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

// --- LÍNEAS DE DEPURACIÓN AÑADIDAS ---
// Muestra los valores de las variables de entorno antes de la conexión
console.log('--- Configuración de la base de datos ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('---------------------------------------');

// Configuración de la conexión a la base de datos usando variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log,
  }
);

// Cargar todos los modelos de la carpeta
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// --- TODAS LAS ASOCIACIONES EN UN SOLO LUGAR ---
// 1. Relación uno a muchos: Supplier tiene muchos Products
db.Supplier.hasMany(db.Product, { foreignKey: 'supplier_id', as: 'supplierProducts' });
db.Product.belongsTo(db.Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

// 2. Relación muchos a muchos: Order y Product a través de OrderProduct
db.Order.belongsToMany(db.Product, { through: db.OrderProduct, foreignKey: 'order_id', as: 'products' });
db.Product.belongsToMany(db.Order, { through: db.OrderProduct, foreignKey: 'product_id', as: 'orders' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;