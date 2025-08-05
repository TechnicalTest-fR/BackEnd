const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * @swagger
 * tags:
 * - name: Products
 * description: Operaciones de gestión de productos
 *
 * components:
 * schemas:
 * SupplierInfo:
 * type: object
 * properties:
 * id:
 * type: integer
 * description: El ID del proveedor.
 * company_name:
 * type: string
 * description: El nombre de la compañía del proveedor.
 *
 * Product:
 * type: object
 * required:
 * - code_product
 * - name
 * - unit_price
 * properties:
 * id:
 * type: integer
 * description: El ID autogenerado del producto.
 * code_product:
 * type: string
 * description: Código único del producto.
 * name:
 * type: string
 * description: Nombre del producto.
 * classification:
 * type: string
 * description: Clasificación del producto (e.g., categoría).
 * stock:
 * type: integer
 * default: 0
 * description: Cantidad de productos en inventario.
 * unit_price:
 * type: number
 * format: float
 * description: Precio actual del producto.
 * previous_unit_price:
 * type: number
 * format: float
 * description: Precio anterior del producto (si aplica).
 * supplier_id:
 * type: integer
 * description: El ID del proveedor asociado.
 * Supplier:
 * $ref: '#/components/schemas/SupplierInfo'
 *
 * ProductInput:
 * type: object
 * required:
 * - code_product
 * - name
 * - unit_price
 * properties:
 * code_product:
 * type: string
 * description: Código único del producto.
 * example: P-001
 * name:
 * type: string
 * description: Nombre del producto.
 * example: Nuevo Producto XYZ
 * classification:
 * type: string
 * description: Clasificación del producto.
 * example: Electrónica
 * stock:
 * type: integer
 * description: Cantidad de productos en inventario.
 * example: 50
 * unit_price:
 * type: number
 * format: float
 * description: Precio actual del producto.
 * example: 99.99
 * previous_unit_price:
 * type: number
 * format: float
 * description: Precio anterior del producto.
 * example: 95.00
 * supplier_id:
 * type: integer
 * description: ID del proveedor asociado.
 * example: 1
 */


/**
 * @swagger
 * /products:
 * get:
 * summary: Obtener todos los productos
 * tags: [Products]
 * responses:
 * 200:
 * description: Lista de productos obtenida exitosamente.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Product'
 * 500:
 * description: Error del servidor
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /products/{id}:
 * get:
 * summary: Obtener un producto por ID
 * tags: [Products]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID del producto a obtener
 * responses:
 * 200:
 * description: Producto obtenido exitosamente.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Product'
 * 404:
 * description: Producto no encontrado
 * 500:
 * description: Error del servidor
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /products/supplier/{supplierId}:
 * get:
 * summary: Obtener todos los productos de un proveedor específico
 * tags: [Products]
 * parameters:
 * - in: path
 * name: supplierId
 * required: true
 * schema:
 * type: integer
 * description: ID del proveedor para filtrar los productos
 * responses:
 * 200:
 * description: Lista de productos del proveedor obtenida exitosamente.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Product'
 * 500:
 * description: Error del servidor
 */
router.get('/supplier/:supplierId', productController.getProductsBySupplier);


/**
 * @swagger
 * /products:
 * post:
 * summary: Crear un nuevo producto
 * tags: [Products]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ProductInput'
 * responses:
 * 201:
 * description: Producto creado exitosamente.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Product'
 * 400:
 * description: Datos de entrada inválidos
 * 409:
 * description: Ya existe un producto con este código o nombre.
 * 500:
 * description: Error del servidor
 */
router.post('/', productController.createProduct);

/**
 * @swagger
 * /products/{id}:
 * put:
 * summary: Actualizar un producto existente
 * tags: [Products]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID del producto a actualizar
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ProductInput'
 * responses:
 * 200:
 * description: Producto actualizado exitosamente.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Product'
 * 400:
 * description: Datos inválidos
 * 404:
 * description: Producto no encontrado
 * 409:
 * description: Ya existe un producto con este código o nombre.
 * 500:
 * description: Error del servidor
 */
router.put('/:id', productController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 * delete:
 * summary: Eliminar un producto
 * tags: [Products]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID del producto a eliminar
 * responses:
 * 204:
 * description: Producto eliminado exitosamente. (No Content)
 * 404:
 * description: Producto no encontrado
 * 500:
 * description: Error del servidor
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router;