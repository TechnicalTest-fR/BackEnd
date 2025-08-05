const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

/**
 * @swagger
 * tags:
 * - name: Orders
 * description: Operaciones de gestión de pedidos
 * components:
 * schemas:
 * OrderUpdateStatus:
 * type: object
 * required:
 * - status
 * properties:
 * status:
 * type: string
 * enum: [Pendiente, En Progreso, Completado, Cancelado, Shipped, Delivered]
 * example: En Progreso
 */

// --- Rutas de la API ---

/**
 * @swagger
 * /orders:
 * get:
 * summary: Obtener todos los pedidos
 * tags: [Orders]
 * responses:
 * 200:
 * description: Lista de pedidos obtenida exitosamente.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Order'
 * 500:
 * description: Error del servidor
 */
router.get('/', orderController.getOrders);

/**
 * @swagger
 * /orders/{id}:
 * get:
 * summary: Obtener un pedido por ID
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID del pedido a obtener
 * responses:
 * 200:
 * description: Pedido obtenido exitosamente.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Order'
 * 404:
 * description: Pedido no encontrado
 * 500:
 * description: Error del servidor
 */
router.get('/:id', orderController.getOrderById);

/**
 * @swagger
 * /orders:
 * post:
 * summary: Crear un nuevo pedido
 * tags: [Orders]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/OrderInput'
 * responses:
 * 201:
 * description: Pedido creado exitosamente.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Order'
 * 400:
 * description: Datos de entrada inválidos
 * 409:
 * description: Número de pedido ya existe
 * 500:
 * description: Error del servidor
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /orders/{id}:
 * put:
 * summary: Actualizar un pedido existente
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID del pedido a actualizar
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/OrderInput'
 * responses:
 * 200:
 * description: Pedido actualizado exitosamente.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Order'
 * 400:
 * description: Datos inválidos
 * 404:
 * description: Pedido no encontrado
 * 409:
 * description: Número de pedido ya existe
 * 500:
 * description: Error del servidor
 */
router.put('/:id', orderController.updateOrder);

/**
 * @swagger
 * /orders/{id}:
 * delete:
 * summary: Eliminar un pedido
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID del pedido a eliminar
 * responses:
 * 204:
 * description: Pedido eliminado exitosamente
 * 403:
 * description: No se puede eliminar un pedido completado o cancelado
 * 404:
 * description: Pedido no encontrado
 * 500:
 * description: Error del servidor
 */
router.delete('/:id', orderController.deleteOrder);

/**
 * @swagger
 * /orders/{id}/status:
 * patch:
 * summary: Cambiar el estado de un pedido
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID del pedido para cambiar el estado
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/OrderUpdateStatus'
 * responses:
 * 200:
 * description: Estado del pedido actualizado exitosamente.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Order'
 * 400:
 * description: Estado inválido o datos incorrectos
 * 403:
 * description: No se puede cambiar el estado de un pedido que ya está completado, cancelado o entregado
 * 404:
 * description: Pedido no encontrado
 * 500:
 * description: Error del servidor
 */
router.patch('/:id/status', orderController.changeOrderStatus);

module.exports = router;