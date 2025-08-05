// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Order, Product, Supplier, OrderProduct } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- RUTAS SIMILARES A json-server ---
// GET /orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: {
        model: Product,
        through: {
          attributes: ['quantity', 'unit_price', 'supplier_id']
        }
      }
    });
    res.json(orders);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// GET /products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll({ include: ['supplier'] });
    res.json(products);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /suppliers
app.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (err) {
    console.error('Error al obtener proveedores:', err);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// POST /orders
app.post('/orders', async (req, res) => {
  try {
    const {
      order_number,
      customer_name,
      order_date,
      payment_status,
      payment_method,
      status,
      num_products,
      final_price,
      shipping_address,
      shipping_method,
      tracking_number,
      notes,
      products // Array de productos [{ product_id, quantity, unit_price, supplier_id }]
    } = req.body;

    const newOrder = await Order.create({
      order_number,
      customer_name,
      order_date,
      payment_status,
      payment_method,
      status,
      num_products,
      final_price,
      shipping_address,
      shipping_method,
      tracking_number,
      notes
    });

    for (const item of products) {
      await OrderProduct.create({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        supplier_id: item.supplier_id
      });
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error al crear pedido:', err);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// Sincronizar Sequelize y levantar el servidor
sequelize.sync({ alter: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('No se pudo conectar con la base de datos:', err);
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión exitosa con la base de datos');
  })
  .catch((err) => {
    console.error('❌ No se pudo conectar con la base de datos:', err);
  });