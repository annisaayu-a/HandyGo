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
        email: newUser.email,
        default_location: newUser.default_location
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

    // Find user by email and phone
    let whereClause = {};
    if (email && phone_number) {
      whereClause = { email: email, phone_number: phone_number };
    } else {
      whereClause = {
        OR: [
          { phone_number: phone_number || undefined },
          { email: email || undefined }
        ]
      };
    }

    const user = await prisma.user.findFirst({
      where: whereClause
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
        email: user.email,
        default_location: user.default_location
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ error: 'User ID dan Lokasi wajib diisi' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { default_location: location }
    });

    res.json({
      message: 'Lokasi berhasil diperbarui',
      user: {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        default_location: updatedUser.default_location,
        phone_number: updatedUser.phone_number,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Gagal memperbarui lokasi' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId, full_name, phone_number, email } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID wajib diisi' });
    }

    // Check if phone number is already used by someone else
    if (phone_number) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          phone_number: phone_number,
          id: { not: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Nomor HP sudah terdaftar pada akun lain' });
      }
    }

    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { 
          email: email,
          id: { not: userId }
        }
      });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email sudah terdaftar pada akun lain' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        full_name: full_name || undefined,
        phone_number: phone_number || undefined,
        email: email || undefined
      }
    });

    res.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        phone_number: updatedUser.phone_number,
        email: updatedUser.email,
        default_location: updatedUser.default_location,
        profile_picture: updatedUser.profile_picture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
};

const fs = require('fs');
const path = require('path');

exports.uploadProfilePicture = async (req, res) => {
  try {
    const { userId, imageBase64 } = req.body;

    if (!userId || !imageBase64) {
      return res.status(400).json({ error: 'User ID dan gambar wajib diisi' });
    }

    // Extract base64 data (remove data:image/png;base64, prefix)
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Format gambar tidak valid' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `profile_${userId}_${Date.now()}.png`;
    const filePath = path.join(__dirname, '../../public/uploads', fileName);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${fileName}`;

    // Get old user data to delete old image
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    if (oldUser && oldUser.profile_picture) {
      const oldFilePath = path.join(__dirname, '../../public', oldUser.profile_picture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile_picture: imageUrl }
    });

    res.json({
      message: 'Foto profil berhasil diperbarui',
      user: {
        id: updatedUser.id,
        profile_picture: updatedUser.profile_picture
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Gagal mengunggah foto profil' });
  }
};

exports.deleteProfilePicture = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID wajib diisi' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.profile_picture) {
      const oldFilePath = path.join(__dirname, '../../public', user.profile_picture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile_picture: null }
    });

    res.json({
      message: 'Foto profil berhasil dihapus',
      user: {
        id: updatedUser.id,
        profile_picture: null
      }
    });

  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ error: 'Gagal menghapus foto profil' });
  }
};
