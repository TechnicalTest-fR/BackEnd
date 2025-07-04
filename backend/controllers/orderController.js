const db = require('../models');
const Order = db.Order;
const Product = db.Product;
const OrderProduct = db.OrderProduct;

const calculateOrderTotals = async (productsArray) => {
    let num_products = 0;
    let final_price = 0;

    if (productsArray && productsArray.length > 0) {
        for (const item of productsArray) {
            let unitPrice = item.unit_price;

            if (!unitPrice && item.productId) {
                const productInDb = await Product.findByPk(item.productId, { attributes: ['unit_price'] });
                if (productInDb) {
                    unitPrice = productInDb.unit_price;
                }
            }

            if (unitPrice) {
                num_products += item.quantity;
                final_price += parseFloat(unitPrice) * item.quantity;
            }
        }
    }

    return { num_products, final_price: parseFloat(final_price.toFixed(2)) };
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{
                model: Product,
                as: 'products',
                through: { attributes: ['quantity', 'unit_price'] },
                attributes: ['id', 'name']
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

        const formattedOrder = order.toJSON();
        formattedOrder.products = formattedOrder.products.map(p => ({
            id: p.id,
            name: p.name,
            unit_price: parseFloat(p.OrderProduct.unit_price),
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
            const orderProductsData = [];

            for (const prod of products) {
                const productInDb = await Product.findByPk(prod.productId, { attributes: ['unit_price'] });

                if (!productInDb) {
                    return res.status(400).json({ message: `Product with ID ${prod.productId} not found.` });
                }

                orderProductsData.push({
                    order_id: newOrder.id,
                    product_id: prod.productId,
                    quantity: prod.quantity,
                    unit_price: productInDb.unit_price
                });
            }

            await OrderProduct.bulkCreate(orderProductsData);
        }

        const createdOrder = await Order.findByPk(newOrder.id, {
            include: [{
                model: Product,
                as: 'products',
                through: { attributes: ['quantity', 'unit_price'] },
                attributes: ['id', 'name']
            }]
        });

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

        if (['Completed', 'Cancelled'].includes(currentOrder.status)) {
            return res.status(403).json({ message: 'Cannot edit a completed or cancelled order.' });
        }

        const { num_products, final_price } = await calculateOrderTotals(products);

        await currentOrder.update({
            order_number,
            order_date,
            num_products,
            final_price,
            status
        });

        await OrderProduct.destroy({ where: { order_id: id } });

        if (products && products.length > 0) {
            const orderProductsData = [];

            for (const prod of products) {
                const productInDb = await Product.findByPk(prod.productId, { attributes: ['unit_price'] });

                if (!productInDb) {
                    return res.status(400).json({ message: `Product with ID ${prod.productId} not found.` });
                }

                orderProductsData.push({
                    order_id: id,
                    product_id: prod.productId,
                    quantity: prod.quantity,
                    unit_price: productInDb.unit_price
                });
            }

            await OrderProduct.bulkCreate(orderProductsData);
        }

        const updatedOrder = await Order.findByPk(id, {
            include: [{
                model: Product,
                as: 'products',
                through: { attributes: ['quantity', 'unit_price'] },
                attributes: ['id', 'name']
            }]
        });

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

        if (['Completed', 'Cancelled'].includes(currentOrder.status)) {
            return res.status(403).json({ message: 'Cannot delete a completed or cancelled order.' });
        }

        const deletedRows = await Order.destroy({ where: { id } });
        if (deletedRows === 0) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changeOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "In Progress", "Completed"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const currentOrder = await Order.findByPk(id);
        if (!currentOrder) return res.status(404).json({ message: 'Order not found.' });

        if ((currentOrder.status === 'Completed' && status !== 'Completed') ||
            (currentOrder.status === 'Cancelled' && status !== 'Cancelled')) {
            return res.status(403).json({ message: `Cannot change status of an order that is already ${currentOrder.status}.` });
        }

        await currentOrder.update({ status });
        res.json({ message: 'Order status updated successfully', order: currentOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
