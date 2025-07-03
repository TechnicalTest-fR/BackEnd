// Carga las variables de entorno al inicio (siempre al principio)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models'); // Importa Sequelize y los modelos

// **********************************************
// INICIO: Importaciones y Configuración de SWAGGER
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerDef'); // Asegúrate de que esta ruta sea correcta para tu swaggerDef.js
// **********************************************

// Importa las rutas de tu aplicación
const orderRoutes = require('./routes/orders'); // Nota: Si tus archivos de rutas se llaman orders.js y products.js
const productRoutes = require('./routes/products'); // en la carpeta 'routes', entonces el require es './routes/orders' y './routes/products'

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sincroniza la base de datos (¡Solo en desarrollo! En producción se usan migraciones)
db.sequelize.sync({ force: false }) // 'force: true' para borrar y recrear tablas cada vez (¡peligroso en prod!)
  .then(() => {
    console.log('Database synced successfully with Sequelize.');
    // db.Product.bulkCreate([ ... ] puedes dejar esto comentado para seeding manual o con API)
  })
  .catch(err => {
    console.error('Error syncing database:', err);
    process.exit(1); // Sale si la DB no puede sincronizarse
  });

// Rutas de la API
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// **********************************************
// INICIO: Configuración de la ruta para SWAGGER UI
// Esta línea es la que monta la interfaz de Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// **********************************************

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Pedidos y Productos funcionando con Node.js, Express y Sequelize!');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});