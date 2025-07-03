// backend/controllers/productController.js
const db = require('../models'); // Importa todos los modelos de Sequelize
const Product = db.Product; // Accede al modelo Product

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll(); // Sequelize: SELECT * FROM products
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id); // Sequelize: SELECT * FROM products WHERE id = ?
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body); // Sequelize: INSERT INTO products (...) VALUES (...)
        res.status(201).json(newProduct);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Product name already exists.' });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const [updatedRows] = await Product.update(req.body, { // Sequelize: UPDATE products SET ... WHERE id = ?
            where: { id: req.params.id }
        });
        if (updatedRows === 0) return res.status(404).json({ message: 'Product not found' });
        const updatedProduct = await Product.findByPk(req.params.id); // Obtener el producto actualizado
        res.json(updatedProduct);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Product name already exists.' });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deletedRows = await Product.destroy({ // Sequelize: DELETE FROM products WHERE id = ?
            where: { id: req.params.id }
        });
        if (deletedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};