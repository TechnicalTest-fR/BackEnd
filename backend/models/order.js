'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      this.belongsToMany(models.Product, {
        through: models.OrderProduct,
        as: 'products',
        foreignKey: 'order_id'
      });
    }
  }
  Order.init({
    order_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    payment_status: {
      type: DataTypes.ENUM('Paid', 'Pending'),
      defaultValue: 'Pending',
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM('PAYPAL', 'Credit Card', 'BANK_TRANSFER'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'En Progreso', 'Completado', 'Cancelado', 'Shipped', 'Delivered'),
      defaultValue: 'Pendiente',
    },
    num_products: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    final_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    shipping_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shipping_method: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tracking_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Order',
    timestamps: true
  });
  return Order;
};