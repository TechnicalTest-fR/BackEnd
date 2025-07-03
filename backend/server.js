require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models');

// **********************************************
// INICIO: Importaciones y Configuración de SWAGGER
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerDef'); 
// **********************************************

const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

db.sequelize.sync({ force: false }) // 'force: true' para borrar y recrear tablas cada vez (¡peligroso en prod!)
  .then(() => {
    console.log('Database synced successfully with Sequelize.');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
    process.exit(1);
  });

// Rutas de la API
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// **********************************************
// INICIO: Configuración de la ruta para SWAGGER UI
// Esta línea es la que monta la interfaz de Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// **********************************************

app.get('/', (req, res) => {
  res.send('API de Pedidos y Productos funcionando con Node.js, Express y Sequelize!');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});