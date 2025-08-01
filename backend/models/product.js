module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
  }, {
    timestamps: true,
    tableName: 'products'
  });

  Product.associate = (models) => {
    Product.belongsToMany(models.Order, {
      through: models.OrderProduct,
      foreignKey: 'product_id',
      as: 'orders'
    });
  };

  return Product;
};