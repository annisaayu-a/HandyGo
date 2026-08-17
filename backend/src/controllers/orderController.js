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

    const serviceName = req.body.service_name || 'Belanja';
    
    // Ensure the service exists to attach this order to
    let service = await prisma.service.findFirst({ where: { name: serviceName } });
    if (!service) {
      service = await prisma.service.create({
        data: { name: serviceName, base_price: 10000 }
      });
    }

    const order = await prisma.order.create({
      data: {
        user_id,
        service_id: service.id,
        pickup_location,
        dropoff_location,
        order_details: typeof order_details === 'string' ? order_details : JSON.stringify(order_details),
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
    const { user_id, mitra_id } = req.query;
    
    if (!user_id && !mitra_id) {
      return res.status(400).json({ error: 'user_id atau mitra_id diperlukan' });
    }

    const whereClause = {};
    if (user_id) whereClause.user_id = user_id;
    if (mitra_id) whereClause.mitra_id = mitra_id;

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: { service: true, user: true, mitra: true }
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil pesanan' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status pesanan diperlukan' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ message: 'Status pesanan berhasil diperbarui', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat memperbarui pesanan' });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    // Only return recent pending orders to prevent showing stale data (e.g. within last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const orders = await prisma.order.findMany({
      where: { 
        status: 'menunggu',
        created_at: { gte: oneHourAgo }
      },
      orderBy: { created_at: 'desc' },
      include: { service: true }
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil pesanan' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: { service: true, mitra: true, user: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil pesanan' });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let { mitra_id } = req.body;

    if (!mitra_id) {
      return res.status(400).json({ error: 'ID Mitra diperlukan' });
    }

    if (mitra_id === 'default-mitra-id') {
      const firstMitra = await prisma.mitra.findFirst();
      if (firstMitra) {
        mitra_id = firstMitra.id;
      } else {
        return res.status(400).json({ error: 'Mitra belum tersedia di database' });
      }
    }

    // Ensure order is still pending
    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }
    if (existingOrder.status !== 'menunggu') {
      return res.status(400).json({ error: 'Pesanan sudah diambil atau tidak valid' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { 
        status: 'accepted',
        mitra_id 
      },
      include: { mitra: true }
    });

    res.status(200).json({ message: 'Pesanan berhasil diambil', order });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil pesanan' });
  }
};
