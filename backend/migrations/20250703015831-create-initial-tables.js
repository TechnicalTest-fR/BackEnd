'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Crear la tabla de Proveedores (Suppliers)
    await queryInterface.createTable('Suppliers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ruc: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
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

    // 2. Crear la tabla de Productos (Products) con los nuevos campos y la FK
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code_product: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      classification: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      previous_unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Suppliers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // 3. Crear la tabla de Pedidos (Orders) con los nuevos campos
    await queryInterface.createTable('Orders', {
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
      customer_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      order_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      payment_status: {
        type: Sequelize.ENUM('Paid', 'Pending'),
        defaultValue: 'Pending',
        allowNull: false
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('Pendiente', 'En Progreso', 'Completado', 'Cancelado', 'Shipped', 'Delivered'),
        defaultValue: 'Pendiente',
        allowNull: false
      },
      num_products: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      final_price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      shipping_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shipping_method: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tracking_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
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

    // 4. Crear la tabla de unión (Order_Products)
    await queryInterface.createTable('Order_Products', {
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Products',
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
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Suppliers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Order_Products');
    await queryInterface.dropTable('Orders');
    await queryInterface.dropTable('Products');
    await queryInterface.dropTable('Suppliers');
  }
};