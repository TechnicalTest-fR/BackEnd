const db = require('../models');
const Product = db.Product;

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body); 
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
        const [updatedRows] = await Product.update(req.body, { 
            where: { id: req.params.id }
        });
        if (updatedRows === 0) return res.status(404).json({ message: 'Product not found' });
        const updatedProduct = await Product.findByPk(req.params.id);
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
        const deletedRows = await Product.destroy({
            where: { id: req.params.id }
        });
        if (deletedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};