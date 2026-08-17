const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMessages = async (req, res) => {
  try {
    const { order_id } = req.params;
    
    if (!order_id) {
      return res.status(400).json({ error: 'order_id diperlukan' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { order_id },
      orderBy: { created_at: 'asc' }
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { order_id, sender_type, text } = req.body;

    if (!order_id || !sender_type || !text) {
      return res.status(400).json({ error: 'Data pesan tidak lengkap' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        order_id,
        sender_type,
        text
      }
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengirim pesan' });
  }
};
