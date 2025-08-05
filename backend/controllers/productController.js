// controllers/productController.js

const { Product, Supplier } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: {
        model: Supplier,
        as: 'Supplier',
        attributes: ['id', 'company_name'],
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los productos.' });
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: {
        model: Supplier,
        as: 'Supplier',
        attributes: ['id', 'company_name'],
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Error del servidor al obtener el producto.' });
  }
};

// Obtener productos por proveedor
const getProductsBySupplier = async (req, res) => {
  const { supplierId } = req.params;
  try {
    const products = await Product.findAll({
      where: { supplier_id: supplierId },
      include: {
        model: Supplier,
        as: 'Supplier',
        attributes: ['id', 'company_name'],
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products by supplier:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los productos del proveedor.' });
  }
};

// Crear un nuevo producto
const createProduct = async (req, res) => {
  const { code_product, name, ...rest } = req.body;
  try {
    const existingProduct = await Product.findOne({
      where: {
        [Op.or]: [{ code_product }, { name }],
      },
    });
    if (existingProduct) {
      return res.status(409).json({ error: 'Ya existe un producto con este código o nombre.' });
    }

    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error del servidor al crear el producto.' });
  }
};

// Actualizar un producto existente
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { code_product, name, unit_price, ...rest } = req.body;
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    // Si el precio unitario cambia, actualizamos el precio anterior
    const updateData = { ...req.body };
    if (unit_price && product.unit_price !== unit_price) {
      updateData.previous_unit_price = product.unit_price;
    }

    await product.update(updateData);
    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el producto.' });
  }
};

// Eliminar un producto
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    await product.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar el producto.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsBySupplier,
  createProduct,
  updateProduct,
  deleteProduct,
};