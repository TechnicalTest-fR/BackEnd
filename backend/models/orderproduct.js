'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderProduct extends Model {}
  
  OrderProduct.init({
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Suppliers',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'OrderProduct',
    timestamps: false,
    tableName: 'OrderProducts' // Correcting the table name for consistency
  });

  return OrderProduct;
};