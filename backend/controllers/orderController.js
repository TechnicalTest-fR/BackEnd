const { Order, Product, OrderProduct } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los pedidos
const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: {
        model: Product,
        as: 'products',
        through: { attributes: ['quantity', 'unit_price'] },
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los pedidos.' });
  }
};

// Obtener un pedido por ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: {
        model: Product,
        as: 'products',
        through: { attributes: ['quantity', 'unit_price'] },
      },
    });
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ error: 'Error del servidor al obtener el pedido.' });
  }
};

// Crear un nuevo pedido
const createOrder = async (req, res) => {
  const { products, ...orderData } = req.body;
  try {
    const existingOrder = await Order.findOne({ where: { order_number: orderData.order_number } });
    if (existingOrder) {
      return res.status(409).json({ error: 'Ya existe un pedido con este número.' });
    }

    const productIds = products.map(p => p.productId);
    const availableProducts = await Product.findAll({ where: { id: { [Op.in]: productIds } } });

    if (availableProducts.length !== productIds.length) {
      return res.status(400).json({ error: 'Alguno de los productos no existe.' });
    }

    let finalPrice = 0;
    const orderProducts = [];
    for (const p of products) {
      const product = availableProducts.find(ap => ap.id === p.productId);
      if (product.stock < p.quantity) {
        return res.status(400).json({ error: `No hay suficiente stock para el producto con ID ${p.productId}.` });
      }
      finalPrice += product.unit_price * p.quantity;
      orderProducts.push({
        product_id: p.productId,
        quantity: p.quantity,
        unit_price: product.unit_price,
      });
      product.stock -= p.quantity;
      await product.save();
    }

    const order = await Order.create({
      ...orderData,
      final_price: finalPrice,
      num_products: products.length,
    });

    await order.addProducts(orderProducts.map(p => p.product_id), { through: orderProducts });

    const newOrder = await Order.findByPk(order.id, {
      include: {
        model: Product,
        as: 'products',
        through: { attributes: ['quantity', 'unit_price'] },
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error del servidor al crear el pedido.' });
  }
};

// Actualizar un pedido existente
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { products, ...orderData } = req.body;
  try {
    const order = await Order.findByPk(id, {
      include: {
        model: Product,
        as: 'products',
        through: { attributes: ['quantity', 'unit_price'] },
      },
    });
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    await order.update(orderData);

    if (products) {
      await order.setProducts([]);
      let finalPrice = 0;
      const orderProducts = [];
      for (const p of products) {
        const product = await Product.findByPk(p.productId);
        if (!product) {
          return res.status(400).json({ error: `Producto con ID ${p.productId} no encontrado.` });
        }
        finalPrice += product.unit_price * p.quantity;
        orderProducts.push({
          product_id: p.productId,
          quantity: p.quantity,
          unit_price: product.unit_price,
        });
      }
      await order.update({
        final_price: finalPrice,
        num_products: products.length,
      });
      await order.addProducts(orderProducts.map(p => p.product_id), { through: orderProducts });
    }

    const updatedOrder = await Order.findByPk(id, {
      include: {
        model: Product,
        as: 'products',
        through: { attributes: ['quantity', 'unit_price'] },
      },
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el pedido.' });
  }
};

// Eliminar un pedido
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    if (['Completado', 'Cancelado'].includes(order.status)) {
      return res.status(403).json({ error: 'No se puede eliminar un pedido con estado "Completado" o "Cancelado".' });
    }

    const orderProducts = await OrderProduct.findAll({ where: { order_id: id } });
    for (const op of orderProducts) {
      await Product.increment('stock', { by: op.quantity, where: { id: op.product_id } });
    }

    await order.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar el pedido.' });
  }
};

// Cambiar el estado de un pedido
const changeOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    if (['Completado', 'Cancelado', 'Delivered'].includes(order.status)) {
      return res.status(403).json({ error: 'No se puede cambiar el estado de un pedido que ya ha sido completado, cancelado o entregado.' });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error('Error changing order status:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el estado del pedido.' });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  changeOrderStatus,
};