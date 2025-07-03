'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tabla 'products'
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Tabla 'orders' - PRESTA ESPECIAL ATENCIÓN A ESTA SECCIÓN
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      order_date: {
        type: Sequelize.DATE, // <-- CAMBIADO a Sequelize.DATE
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()') // <-- CAMBIADO a NOW()
      },
      num_products: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false // Asegúrate de que no sea nulo si tiene un default
      },
      final_price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00, // Asegúrate de que no sea nulo si tiene un default
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
        defaultValue: 'Pending',
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Tabla 'order_products' (Tabla intermedia)
    await queryInterface.createTable('order_products', {
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'orders', // Nombre de la tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'products', // Nombre de la tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Orden inverso de borrado para manejar las FK
    await queryInterface.dropTable('order_products');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('products');
  }
};