const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyhandygo';

exports.register = async (req, res) => {
  try {
    const { full_name, phone_number, email, password } = req.body;

    // Validate input
    if (!full_name || (!phone_number && !email) || !password) {
      return res.status(400).json({ error: 'Nama, Email/No. Hp, dan Password wajib diisi' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone_number },
          { email: email ? email : undefined }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Nomor Hp atau Email sudah terdaftar' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        full_name,
        phone_number,
        email,
        password_hash
      }
    });

    // Generate token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        phone_number: newUser.phone_number,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone_number, email, password } = req.body;

    if ((!phone_number && !email) || !password) {
      return res.status(400).json({ error: 'Identitas dan Password wajib diisi' });
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone_number: phone_number || undefined },
          { email: email || undefined }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Akun tidak ditemukan' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Password salah' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};
