// seed.js

require('dotenv').config();
const db = require('./models');
const { orders, products, suppliers } = require('./data.json');

const seedDatabase = async () => {
  try {
    // Sincronizar la base de datos y borrar todo lo existente.
    // Esto es INTENCIONAL para el seeding.
    await db.sequelize.sync({ force: true });
    console.log('Database synced. All tables were dropped and recreated.');

    // 1. Crear proveedores
    // Usamos SupplierInput para evitar crear los campos que no existen en el modelo
    const createdSuppliers = await db.Supplier.bulkCreate(suppliers, { validate: true });
    console.log(`Created ${createdSuppliers.length} suppliers.`);

    // 2. Crear productos
    // Usamos ProductInput para evitar crear los campos que no existen en el modelo
    const createdProducts = await db.Product.bulkCreate(products, { validate: true });
    console.log(`Created ${createdProducts.length} products.`);

    // 3. Crear órdenes y sus productos asociados
    for (const orderData of orders) {
      const { products: orderProducts, ...restOrderData } = orderData;

      // Calcular el num_products y final_price del JSON si no vienen o son incorrectos
      const numProducts = orderProducts.length;
      const finalPrice = orderProducts.reduce((sum, p) => sum + p.unit_price * p.quantity, 0);

      const order = await db.Order.create({
        ...restOrderData,
        num_products: numProducts,
        final_price: finalPrice,
      });

      console.log(`Created order: ${order.order_number}`);

      const orderProductEntries = orderProducts.map(p => ({
        order_id: order.id,
        product_id: p.productId,
        quantity: p.quantity,
        unit_price: p.unit_price,
        supplier_id: p.supplier_id // Asegúrate de que este campo exista en tu data.json
      }));

      await db.OrderProduct.bulkCreate(orderProductEntries);
      console.log(`Associated ${orderProductEntries.length} products with order ${order.order_number}`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await db.sequelize.close();
    console.log('Database connection closed.');
  }
};

seedDatabase();