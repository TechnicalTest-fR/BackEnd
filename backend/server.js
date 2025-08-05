// server.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerDef');

const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products');
const supplierRoutes = require('./routes/suppliers');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    // Sincronizar la base de datos sin forzar, para evitar perder datos
    await db.sequelize.sync({ force: false }); 
    console.log('Database synced successfully with Sequelize.');

    // Rutas de la API
    app.use('/api/orders', orderRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/suppliers', supplierRoutes);

    // Configuración de la ruta para SWAGGER UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get('/', (req, res) => {
      res.send('API de Pedidos y Productos funcionando con Node.js, Express y Sequelize!');
    });

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
    });

  } catch (err) {
    console.error('Error starting server or syncing database:', err);
    process.exit(1);
  }
}

startServer();