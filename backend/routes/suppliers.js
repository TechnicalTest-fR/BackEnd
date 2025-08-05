const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

/**
 * @swagger
 * tags:
 * - name: Suppliers
 * description: API para la gestión de proveedores
 */

// --- Rutas de la API ---

/**
 * @swagger
 * /suppliers:
 * get:
 * summary: Obtener todos los proveedores con sus productos
 * tags: [Suppliers]
 * responses:
 * 200:
 * description: Una lista de proveedores con sus productos.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Supplier'
 * 500:
 * description: Error del servidor.
 */
router.get('/', supplierController.getSuppliers);

/**
 * @swagger
 * /suppliers/{id}:
 * get:
 * summary: Obtener un proveedor por ID con sus productos
 * tags: [Suppliers]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID del proveedor a obtener.
 * responses:
 * 200:
 * description: Un proveedor encontrado con sus productos.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Supplier'
 * 404:
 * description: Proveedor no encontrado.
 * 500:
 * description: Error del servidor.
 */
router.get('/:id', supplierController.getSupplierById);

/**
 * @swagger
 * /suppliers:
 * post:
 * summary: Crear un nuevo proveedor
 * tags: [Suppliers]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/SupplierInput'
 * responses:
 * 201:
 * description: Proveedor creado exitosamente.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Supplier'
 * 400:
 * description: Datos de entrada no válidos.
 * 409:
 * description: Ya existe un proveedor con este RUC.
 * 500:
 * description: Error del servidor.
 */
router.post('/', supplierController.createSupplier);

/**
 * @swagger
 * /suppliers/{id}:
 * put:
 * summary: Actualizar un proveedor por ID
 * tags: [Suppliers]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID del proveedor a actualizar.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/SupplierInput'
 * responses:
 * 200:
 * description: Proveedor actualizado.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Supplier'
 * 404:
 * description: Proveedor no encontrado.
 * 409:
 * description: Ya existe un proveedor con este RUC.
 * 500:
 * description: Error del servidor.
 */
router.put('/:id', supplierController.updateSupplier);

/**
 * @swagger
 * /suppliers/{id}:
 * delete:
 * summary: Eliminar un proveedor por ID
 * tags: [Suppliers]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID del proveedor a eliminar.
 * responses:
 * 204:
 * description: Proveedor eliminado exitosamente.
 * 404:
 * description: Proveedor no encontrado.
 * 500:
 * description: Error del servidor.
 */
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;