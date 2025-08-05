// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Order, Product, Supplier, OrderProduct } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Database Connection Check ---
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión exitosa con la base de datos');
  })
  .catch((err) => {
    console.error('❌ No se pudo conectar con la base de datos:', err);
  });

// --- API Routes ---

app.get('/', (req, res) => {
  res.status(200).send('¡Bienvenido a la API del backend de OrderFlow!');
});

// --- RUTAS DE ORDERS ---
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: { model: Product, as: 'products', through: { attributes: ['quantity', 'unit_price', 'supplier_id'] } }
    });
    res.json(orders);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});
app.get('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByPk(id, {
      include: { model: Product, as: 'products', through: { attributes: ['quantity', 'unit_price', 'supplier_id'] } }
    });
    if (!order) { return res.status(404).json({ error: 'Pedido no encontrado' }); }
    res.status(200).json(order);
  } catch (err) {
    console.error('Error al obtener el pedido:', err);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
});
app.post('/orders', async (req, res) => {
  try {
    const { order_number, customer_name, order_date, payment_status, payment_method, status, shipping_address, shipping_method, tracking_number, notes, products } = req.body;
    const newOrder = await Order.create({
      order_number, customer_name, order_date, payment_status, payment_method, status,
      num_products: products ? products.length : 0,
      final_price: products ? products.reduce((sum, p) => sum + p.quantity * p.unit_price, 0) : 0,
      shipping_address, shipping_method, tracking_number, notes
    });
    if (products && products.length > 0) {
      for (const item of products) {
        await OrderProduct.create({
          order_id: newOrder.id, product_id: item.productId, quantity: item.quantity,
          unit_price: item.unit_price, supplier_id: item.supplier_id
        });
      }
    }
    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error al crear pedido:', err);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});
app.patch('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByPk(id);
    if (!order) { return res.status(404).json({ error: 'Pedido no encontrado' }); }
    const updatedOrder = await order.update(req.body);
    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error('Error al actualizar el pedido:', err);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});
app.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByPk(id);
    if (!order) { return res.status(404).json({ error: 'Pedido no encontrado' }); }
    await order.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar pedido:', err);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

// --- RUTAS DE PRODUCTS ---
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll({ include: ['supplier'] });
    res.json(products);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});
app.post('/products', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { unit_price } = req.body;
  try {
    const product = await Product.findByPk(id);
    if (!product) { return res.status(404).json({ error: 'Producto no encontrado' }); }
    if (unit_price && parseFloat(unit_price) !== parseFloat(product.unit_price)) { req.body.previous_unit_price = product.unit_price; }
    await product.update(req.body);
    res.status(200).json(product);
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) { return res.status(404).json({ error: 'Producto no encontrado' }); }
    await product.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// --- RUTAS DE SUPPLIERS ---
app.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (err) {
    console.error('Error al obtener proveedores:', err);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});
app.post('/suppliers', async (req, res) => {
  try {
    const newSupplier = await Supplier.create(req.body);
    res.status(201).json(newSupplier);
  } catch (err) {
    console.error('Error al crear el proveedor:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'El RUC o el nombre de la compañía ya existen.' });
    }
    res.status(500).json({ error: 'Error al crear el proveedor' });
  }
});
app.delete('/suppliers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) { return res.status(404).json({ error: 'Proveedor no encontrado' }); }
    await supplier.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar proveedor:', err);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
});


// --- Server Startup ---
sequelize.sync({ alter: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('No se pudo conectar con la base de datos y levantar el servidor:', err);
});

app.put('/suppliers/:id', async (req, res) => {
    const { id } = req.params;
    const { company_name, ruc, contact, address } = req.body;
    
    try {
        const supplier = await Supplier.findByPk(id);

        if (!supplier) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        // Actualizar el proveedor con los nuevos datos
        await supplier.update({
            company_name,
            ruc,
            contact,
            address
        });
        
        res.status(200).json(supplier);

    } catch (err) {
        console.error('Error al actualizar proveedor:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'El RUC o el nombre de la compañía ya existen.' });
        }
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
});