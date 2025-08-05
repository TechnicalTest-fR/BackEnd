// swaggerDef.js

const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Pedidos y Productos',
      version: '1.0.0',
      description: 'Documentación de la API para un sistema de gestión de pedidos y productos',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      schemas: {
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_number: { type: 'string', description: 'Número único del pedido.', example: 'ORD-20250805-001' },
            customer_name: { type: 'string', description: 'Nombre del cliente.', example: 'Juan Pérez' },
            order_date: { type: 'string', format: 'date', description: 'Fecha del pedido.' },
            payment_status: { type: 'string', enum: ['Paid', 'Pending'], description: 'Estado del pago del pedido.' },
            payment_method: { type: 'string', enum: ['PAYPAL', 'Credit Card', 'BANK_TRANSFER'], description: 'Método de pago.' },
            status: { type: 'string', enum: ['Pendiente', 'En Progreso', 'Completado', 'Cancelado', 'Shipped', 'Delivered'], description: 'Estado actual del pedido.' },
            num_products: { type: 'integer', description: 'Número total de productos en el pedido.' },
            final_price: { type: 'number', format: 'float', description: 'Precio final total del pedido.' },
            shipping_address: { type: 'string' },
            shipping_method: { type: 'string' },
            tracking_number: { type: 'string' },
            notes: { type: 'string' },
            products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ProductInOrder'
              }
            },
          },
        },
        OrderInput: {
          type: 'object',
          required: ['order_number', 'customer_name', 'products'],
          properties: {
            order_number: { type: 'string', description: 'Número único del pedido.', example: 'ORD-20250805-001' },
            customer_name: { type: 'string', description: 'Nombre del cliente.', example: 'Juan Pérez' },
            order_date: { type: 'string', format: 'date', description: 'Fecha del pedido.' },
            payment_status: { type: 'string', enum: ['Paid', 'Pending'], description: 'Estado del pago.' },
            payment_method: { type: 'string', enum: ['PAYPAL', 'Credit Card', 'BANK_TRANSFER'], description: 'Método de pago.' },
            status: { type: 'string', enum: ['Pendiente', 'En Progreso', 'Completado', 'Cancelado', 'Shipped', 'Delivered'], description: 'Estado del pedido.' },
            shipping_address: { type: 'string' },
            shipping_method: { type: 'string' },
            tracking_number: { type: 'string' },
            notes: { type: 'string' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'integer' },
                  quantity: { type: 'integer' }
                }
              }
            },
          },
        },
        Product: {
          type: 'object',
          required: ['code_product', 'name', 'unit_price'],
          properties: {
            id: { type: 'integer' },
            code_product: { type: 'string', example: 'P-001' },
            name: { type: 'string', example: 'Producto XYZ' },
            classification: { type: 'string' },
            stock: { type: 'integer', default: 0 },
            unit_price: { type: 'number', format: 'float', example: 99.99 },
            previous_unit_price: { type: 'number', format: 'float' },
            supplier_id: { type: 'integer' },
            Supplier: { $ref: '#/components/schemas/SupplierInfo' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['code_product', 'name', 'unit_price'],
          properties: {
            code_product: { type: 'string', example: 'P-001' },
            name: { type: 'string', example: 'Nuevo Producto XYZ' },
            classification: { type: 'string' },
            stock: { type: 'integer', example: 50 },
            unit_price: { type: 'number', format: 'float', example: 99.99 },
            previous_unit_price: { type: 'number', format: 'float' },
            supplier_id: { type: 'integer', example: 1 },
          },
        },
        ProductInOrder: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            code_product: { type: 'string' },
            classification: { type: 'string' },
            OrderProduct: {
              type: 'object',
              properties: {
                quantity: { type: 'integer' },
                unit_price: { type: 'number', format: 'float' },
                supplier_id: { type: 'integer' }
              }
            },
          },
        },
        Supplier: {
          type: 'object',
          required: ['company_name', 'ruc'],
          properties: {
            id: { type: 'integer' },
            company_name: { type: 'string', example: 'Distribuidora del Norte S.A.' },
            ruc: { type: 'string', example: '20123456789' },
            contact: { type: 'string', description: 'Información de contacto (e.g., Nombre - Teléfono)', example: 'Juan Pérez - 987654321' },
            address: { type: 'string', example: 'Av. Los Próceres 123, Lima' },
            Products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ProductInSupplier'
              },
            },
          },
        },
        SupplierInput: {
          type: 'object',
          required: ['company_name', 'ruc'],
          properties: {
            company_name: { type: 'string', example: 'Distribuidora del Norte S.A.' },
            ruc: { type: 'string', example: '20123456789' },
            contact: { type: 'string', example: 'Juan Pérez - 987654321' },
            address: { type: 'string', example: 'Av. Los Próceres 123, Lima' },
          },
        },
        SupplierInfo: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            company_name: { type: 'string' },
          },
        },
        ProductInSupplier: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code_product: { type: 'string' },
            name: { type: 'string' },
            unit_price: { type: 'number', format: 'float' },
            stock: { type: 'integer' },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, './routes/*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;