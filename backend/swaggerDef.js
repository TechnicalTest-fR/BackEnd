const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Pedidos y Productos',
      version: '1.0.0',
      description: 'Documentación de la API para la gestión de pedidos y productos, construida con Node.js, Express y Sequelize.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api', 
        description: 'Servidor de Desarrollo Local',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'unit_price'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID auto-generado del producto',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'Laptop Dell XPS 15'
            },
            unit_price: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto',
              example: 1800.00
            },
            description: {
              type: 'string',
              description: 'Descripción del producto',
              example: 'Potente laptop con pantalla OLED.'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Fecha de creación del registro',
                example: '2025-07-02T10:00:00Z'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Última fecha de actualización del registro',
                example: '2025-07-02T10:00:00Z'
            }
          },
        },
        Order: {
            type: 'object',
            required: ['order_number', 'order_date', 'status'],
            properties: {
                id: {
                    type: 'integer',
                    description: 'ID auto-generado de la orden',
                    example: 1
                },
                order_number: {
                    type: 'string',
                    description: 'Número único de la orden',
                    example: 'ORD-2025-001'
                },
                order_date: {
                    type: 'string',
                    format: 'date',
                    description: 'Fecha de la orden (YYYY-MM-DD)',
                    example: '2025-07-02'
                },
                num_products: {
                    type: 'integer',
                    description: 'Número total de productos en la orden',
                    example: 2
                },
                final_price: {
                    type: 'number',
                    format: 'float',
                    description: 'Precio total final de la orden',
                    example: 1950.00
                },
                status: {
                    type: 'string',
                    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], 
                    description: 'Estado actual de la orden',
                    example: 'Pending'
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-07-02T10:00:00Z'
                },
                updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-07-02T10:00:00Z'
                },
                products: { 
                    type: 'array',
                    items: {
                        allOf: [
                            { $ref: '#/components/schemas/Product' },
                            { type: 'object', properties: {
                                quantity: { type: 'integer', example: 1 },
                                unit_price: { type: 'number', format: 'float', example: 1800.00 }
                            }}
                        ]
                    }
                }
            }
        },
        // --- Esquema para el cuerpo de la petición al crear/actualizar una Order ---
        OrderInput: {
            type: 'object',
            required: ['order_number', 'order_date', 'status'],
            properties: {
                order_number: { type: 'string', example: 'ORD-2025-001' },
                order_date: { type: 'string', format: 'date', example: '2025-07-02' },
                status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], example: 'Pending' },
                products: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['productId', 'quantity', 'unit_price'],
                        properties: {
                            productId: { type: 'integer', example: 1 },
                            quantity: { type: 'integer', example: 1 },
                            unit_price: { type: 'number', format: 'float', example: 1800.00 }
                        }
                    }
                }
            }
        }
      }, // Cierre del objeto `schemas`
    }, // Cierre del objeto `components`
    // Definir tags para agrupar las rutas en la UI de Swagger
    tags: [
      { name: 'Products', description: 'Operaciones relacionadas con productos' },
      { name: 'Orders', description: 'Operaciones relacionadas con pedidos' },
    ],
  }, // Cierre del objeto `definition`
  // Esto le dice a swagger-jsdoc dónde buscar los comentarios JSDoc para generar la especificación
  apis: [
    './routes/orders.js', // Ruta específica para órdenes
    './routes/products.js', // Ruta específica para productos (¡asegurado el nombre correcto aquí!)
  ],
}; // Cierre del objeto `options`

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;