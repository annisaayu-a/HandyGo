const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
  try {
    const { 
      user_id, 
      pickup_location, 
      dropoff_location, 
      order_details, 
      estimated_price, 
      payment_method 
    } = req.body;

    if (!user_id || !pickup_location || !dropoff_location || !order_details || !estimated_price || !payment_method) {
      return res.status(400).json({ error: 'Data pesanan tidak lengkap' });
    }

    // Since we just added Service, let's ensure a "Belanja" service exists to attach this order to
    let service = await prisma.service.findFirst({ where: { name: 'Belanja' } });
    if (!service) {
      service = await prisma.service.create({
        data: { name: 'Belanja', base_price: 10000 }
      });
    }

    const order = await prisma.order.create({
      data: {
        user_id,
        service_id: service.id,
        pickup_location,
        dropoff_location,
        order_details,
        estimated_price: parseFloat(estimated_price),
        payment_method,
        status: 'menunggu'
      }
    });

    res.status(201).json({ message: 'Pesanan berhasil dibuat', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat membuat pesanan' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id diperlukan' });
    }

    const orders = await prisma.order.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
      include: { service: true }
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil pesanan' });
  }
};
