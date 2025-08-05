'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      this.belongsToMany(models.Order, {
        through: models.OrderProduct,
        foreignKey: 'product_id',
        as: 'orders' // Alias en minúsculas
      });
      this.belongsTo(models.Supplier, {
        foreignKey: 'supplier_id',
        onDelete: 'SET NULL',
        as: 'supplier' // Alias en minúsculas
      });
    }
  }
  Product.init({
    code_product: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    classification: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    previous_unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
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
    modelName: 'Product',
    timestamps: true
  });
  return Product;
};