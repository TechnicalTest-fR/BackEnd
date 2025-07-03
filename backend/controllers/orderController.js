// backend/controllers/orderController.js
const db = require('../models');
const Order = db.Order;
const Product = db.Product;
const OrderProduct = db.OrderProduct;

// Función auxiliar para calcular num_products y final_price
const calculateOrderTotals = async (productsArray) => {
    let num_products = 0;
    let final_price = 0;

    if (productsArray && productsArray.length > 0) {
        for (const item of productsArray) {
            // Asegurarse de que el precio unitario sea correcto, podría venir del frontend o buscarlo
            // Para mayor seguridad, podrías buscar el precio del producto desde la DB
            let unitPrice = item.price; // Asumimos que viene en el objeto del frontend

            if (!unitPrice && item.id) { // Si no viene el precio, búscalo por el ID del producto
                const productInDb = await Product.findByPk(item.id, { attributes: ['price'] });
                if (productInDb) {
                    unitPrice = productInDb.price;
                }
            }

            if (unitPrice) {
                num_products += item.quantity;
                final_price += (parseFloat(unitPrice) * item.quantity);
            }
        }
    }
    return { num_products, final_price: parseFloat(final_price.toFixed(2)) };
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ // Incluye los productos asociados a la orden
                model: Product,
                as: 'products',
                through: { attributes: ['quantity', 'unit_price'] }, // Incluye atributos de la tabla intermedia
                attributes: ['id', 'name'] // Atributos del producto que quieres
            }]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{
                model: Product,
                as: 'products',
                through: { attributes: ['quantity', 'unit_price'] },
                attributes: ['id', 'name']
            }]
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Formatear los productos para que sean consistentes con lo que espera el frontend
        const formattedOrder = order.toJSON();
        formattedOrder.products = formattedOrder.products.map(p => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.OrderProduct.unit_price), // Usar el precio de la tabla intermedia
            quantity: p.OrderProduct.quantity
        }));

        res.json(formattedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createOrder = async (req, res) => {
    const { order_number, products, status } = req.body;
    const order_date = req.body.order_date || new Date().toISOString().split('T')[0];

    try {
        if (!order_number) {
            return res.status(400).json({ message: 'Order number is required.' });
        }

        const { num_products, final_price } = await calculateOrderTotals(products);

        const newOrder = await Order.create({
            order_number,
            order_date,
            num_products,
            final_price,
            status: status || 'Pending'
        });

        if (products && products.length > 0) {
            // Preparar los datos para la tabla intermedia
            const orderProductsData = [];
            for (const prod of products) {
                const productInDb = await Product.findByPk(prod.id, { attributes: ['price'] });
                if (!productInDb) {
                    // Considerar cómo manejar si un producto no existe
                    return res.status(400).json({ message: `Product with ID ${prod.id} not found.` });
                }
                orderProductsData.push({
                    order_id: newOrder.id,
                    product_id: prod.id,
                    quantity: prod.quantity,
                    unit_price: productInDb.price // Usa el precio de la base de datos para consistencia
                });
            }
            await OrderProduct.bulkCreate(orderProductsData);
        }

        const createdOrder = await exports.getOrderById(newOrder.id); // Obtener la orden con productos asociados
        res.status(201).json(createdOrder);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Order number already exists.' });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    const { id } = req.params;
    const { order_number, order_date, products, status } = req.body;

    try {
        const currentOrder = await Order.findByPk(id);
        if (!currentOrder) return res.status(404).json({ message: 'Order not found.' });

        // **Validación para Extra c: No editar órdenes completadas o canceladas**
        if (currentOrder.status === 'Completed' || currentOrder.status === 'Cancelled') {
            return res.status(403).json({ message: 'Cannot edit a completed or cancelled order.' });
        }

        const { num_products, final_price } = await calculateOrderTotals(products);

        // Actualizar la orden principal
        await currentOrder.update({
            order_number,
            order_date,
            num_products,
            final_price,
            status
        });

        // Actualizar los productos de la orden:
        // 1. Eliminar todos los productos existentes de esta orden
        await OrderProduct.destroy({ where: { order_id: id } });

        // 2. Insertar los nuevos productos (o actualizados)
        if (products && products.length > 0) {
            const orderProductsData = [];
            for (const prod of products) {
                const productInDb = await Product.findByPk(prod.id, { attributes: ['price'] });
                if (!productInDb) {
                    return res.status(400).json({ message: `Product with ID ${prod.id} not found.` });
                }
                orderProductsData.push({
                    order_id: id,
                    product_id: prod.id,
                    quantity: prod.quantity,
                    unit_price: productInDb.price // Usar el precio de la base de datos
                });
            }
            await OrderProduct.bulkCreate(orderProductsData);
        }

        const updatedOrder = await exports.getOrderById(id);
        res.json(updatedOrder);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Order number already exists.' });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const currentOrder = await Order.findByPk(id);
        if (!currentOrder) return res.status(404).json({ message: 'Order not found.' });

        // **Validación para Extra c: No eliminar órdenes completadas o canceladas**
        if (currentOrder.status === 'Completed' || currentOrder.status === 'Cancelled') {
            return res.status(403).json({ message: 'Cannot delete a completed or cancelled order.' });
        }

        const deletedRows = await Order.destroy({ where: { id } }); // Sequelize eliminará automáticamente OrderProduct debido a `ON DELETE CASCADE`
        if (deletedRows === 0) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changeOrderStatus = async (req, res) => { // Extra b
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const currentOrder = await Order.findByPk(id);
        if (!currentOrder) return res.status(404).json({ message: 'Order not found.' });

        // **Validación para Extra c: No cambiar estado de órdenes ya completadas/canceladas a otro estado**
        if ((currentOrder.status === 'Completed' && status !== 'Completed') ||
            (currentOrder.status === 'Cancelled' && status !== 'Cancelled')) {
            return res.status(403).json({ message: `Cannot change status of an order that is already ${currentOrder.status}.` });
        }

        await currentOrder.update({ status: status });
        res.json({ message: 'Order status updated successfully', order: currentOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};