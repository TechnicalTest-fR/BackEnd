// controllers/supplierController.js

const { Supplier, Product } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los proveedores
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      include: {
        model: Product,
        attributes: ['id', 'name', 'code_product', 'unit_price', 'stock'],
      },
    });
    res.status(200).json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los proveedores.' });
  }
};

// Obtener un proveedor por ID
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: {
        model: Product,
        attributes: ['id', 'name', 'code_product', 'unit_price', 'stock'],
      },
    });
    if (!supplier) {
      return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    console.error('Error fetching supplier by ID:', error);
    res.status(500).json({ error: 'Error del servidor al obtener el proveedor.' });
  }
};

// Crear un nuevo proveedor
const createSupplier = async (req, res) => {
  const { ruc } = req.body;
  try {
    const existingSupplier = await Supplier.findOne({ where: { ruc } });
    if (existingSupplier) {
      return res.status(409).json({ error: 'Ya existe un proveedor con este RUC.' });
    }
    const newSupplier = await Supplier.create(req.body);
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Error del servidor al crear el proveedor.' });
  }
};

// Actualizar un proveedor
const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { ruc, ...rest } = req.body;
  try {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }

    if (ruc && ruc !== supplier.ruc) {
      const existingSupplier = await Supplier.findOne({ where: { ruc, id: { [Op.ne]: id } } });
      if (existingSupplier) {
        return res.status(409).json({ error: 'Ya existe un proveedor con este RUC.' });
      }
    }

    await supplier.update(req.body);
    res.status(200).json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el proveedor.' });
  }
};

// Eliminar un proveedor
const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }
    await supplier.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar el proveedor.' });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};