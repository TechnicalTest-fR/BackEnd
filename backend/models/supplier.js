'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      this.hasMany(models.Product, {
        foreignKey: 'supplier_id',
        onDelete: 'SET NULL',
        as: 'products' // Alias en minúsculas
      });
    }
  }
  Supplier.init({
    company_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ruc: {
      type: DataTypes.STRING,
      unique: true
    },
    contact: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'Supplier',
    timestamps: true
  });
  return Supplier;
};