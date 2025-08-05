// Este archivo centraliza la configuración de Sequelize, la conexión y las relaciones.

const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la conexión a la base de datos (usando variables de entorno).
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Importar los modelos definidos
const Order = require('./order')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);
const Supplier = require('./supplier')(sequelize, DataTypes);

// Definir la tabla intermedia para la relación de muchos a muchos entre Order y Product
const OrderProduct = sequelize.define('OrderProduct', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  supplier_id: { // <-- Añadir esta propiedad
    type: DataTypes.INTEGER,
    allowNull: true
  }
});


// Definir las asociaciones entre los modelos
// Relación muchos a muchos entre Order y Product
Order.belongsToMany(Product, { through: OrderProduct, foreignKey: 'order_id' });
Product.belongsToMany(Order, { through: OrderProduct, foreignKey: 'product_id' });

// Relación uno a muchos entre Supplier y Product
Supplier.hasMany(Product, { foreignKey: 'supplier_id' });
Product.belongsTo(Supplier, { foreignKey: 'supplier_id' });

// Exportar todo para que esté disponible en el resto de la aplicación
module.exports = {
  sequelize,
  Order,
  Product,
  Supplier,
  OrderProduct
};
