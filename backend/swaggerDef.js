// swaggerDef.js

const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API de Gestión de Pedidos y Productos",
    version: "1.0.0",
    description:
      "Esta es la documentación de la API REST para gestionar pedidos y productos. Permite realizar operaciones CRUD sobre pedidos, productos y proveedores.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Servidor local de desarrollo",
    },
  ],
  components: {
    schemas: {
      Order: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          customer: { type: "string", example: "Juan Pérez" },
          status: {
            type: "string",
            enum: ["pendiente", "en progreso", "completado", "cancelado"],
            example: "pendiente",
          },
          date: { type: "string", format: "date", example: "2023-08-01" },
          total: { type: "number", format: "float", example: 120.5 },
          products: {
            type: "array",
            items: {
              $ref: "#/components/schemas/OrderProduct",
            },
          },
        },
      },
      OrderInput: {
        type: "object",
        required: ["customer", "status", "date", "total", "products"],
        properties: {
          customer: { type: "string", example: "Juan Pérez" },
          status: {
            type: "string",
            enum: ["pendiente", "en progreso", "completado", "cancelado"],
            example: "pendiente",
          },
          date: { type: "string", format: "date", example: "2023-08-01" },
          total: { type: "number", format: "float", example: 120.5 },
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                quantity: { type: "integer", example: 2 },
              },
            },
          },
        },
      },
      OrderProduct: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Producto A" },
          price: { type: "number", format: "float", example: 50.0 },
          quantity: { type: "integer", example: 2 },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Producto A" },
          description: { type: "string", example: "Descripción del producto A" },
          price: { type: "number", format: "float", example: 50.0 },
          stock: { type: "integer", example: 100 },
          supplier: {
            $ref: "#/components/schemas/Supplier",
          },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "description", "price", "stock", "supplierId"],
        properties: {
          name: { type: "string", example: "Producto A" },
          description: { type: "string", example: "Descripción del producto A" },
          price: { type: "number", format: "float", example: 50.0 },
          stock: { type: "integer", example: 100 },
          supplierId: { type: "integer", example: 1 },
        },
      },
      Supplier: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Proveedor 1" },
          email: { type: "string", example: "proveedor1@example.com" },
          phone: { type: "string", example: "123456789" },
        },
      },
      SupplierInput: {
        type: "object",
        required: ["name", "email", "phone"],
        properties: {
          name: { type: "string", example: "Proveedor 1" },
          email: { type: "string", example: "proveedor1@example.com" },
          phone: { type: "string", example: "123456789" },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // Aquí defines tus archivos de rutas documentados con Swagger
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
