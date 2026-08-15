const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyhandygo';

exports.register = async (req, res) => {
  try {
    const { full_name, phone_number, email, password, otpToken, otpCode } = req.body;

    // Validate input
    if (!full_name || (!phone_number && !email) || !password) {
      return res.status(400).json({ error: 'Nama, Email/No. Hp, dan Password wajib diisi' });
    }

    // Verify OTP if provided
    if (otpToken && otpCode) {
      try {
        const decoded = jwt.verify(otpToken, JWT_SECRET);
        if (decoded.otp !== otpCode) {
          return res.status(400).json({ error: 'Kode OTP salah' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Sesi OTP tidak valid atau kedaluwarsa' });
      }
    } else if (process.env.EMAIL_USER && email) {
      return res.status(400).json({ error: 'Kode OTP wajib diisi' });
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
        default_location: user.default_location,
        profile_picture: user.profile_picture,
        role: user.role
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
        profile_picture: updatedUser.profile_picture,
        role: updatedUser.role
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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile_picture: imageBase64 }
    });

    res.json({
      message: 'Foto profil berhasil diperbarui',
      user: {
        id: updatedUser.id,
        profile_picture: updatedUser.profile_picture,
        role: updatedUser.role
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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile_picture: null }
    });

    res.json({ message: 'Foto profil berhasil dihapus' });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ error: 'Gagal menghapus foto profil' });
  }
};

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Token Google tidak ditemukan' });
    }

    // Fetch user profile from google using access token
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    
    if (!response.ok) {
      return res.status(401).json({ error: 'Token Google tidak valid' });
    }
    
    const payload = await response.json();
    const { sub: google_id, email, name, picture } = payload;

    // Check if user exists by google_id or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { google_id: google_id },
          { email: email }
        ]
      }
    });

    if (!user) {
      // Create new user if not exists
      user = await prisma.user.create({
        data: {
          full_name: name,
          email: email,
          google_id: google_id,
          profile_picture: picture, // Use google profile picture
          password_hash: null // No password for google users
        }
      });
    } else if (!user.google_id) {
      // If user exists with email but no google_id, link them
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          google_id: google_id,
          // Optional: update picture if they don't have one
          profile_picture: user.profile_picture || picture
        }
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login Google berhasil',
      token: jwtToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        email: user.email,
        default_location: user.default_location,
        profile_picture: user.profile_picture,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Autentikasi Google gagal' });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email wajib diisi' });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Sign OTP into a JWT token (expires in 5 minutes)
    const otpToken = jwt.sign({ otp: otpCode, email }, JWT_SECRET, { expiresIn: '5m' });

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"HandyGo Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Kode OTP Pendaftaran HandyGo',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #034078;">Verifikasi Akun HandyGo</h2>
          <p>Terima kasih telah mendaftar di HandyGo. Berikut adalah kode OTP Anda:</p>
          <h1 style="font-size: 36px; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px; border-radius: 8px; display: inline-block;">${otpCode}</h1>
          <p style="color: #64748b; font-size: 14px;">Kode ini hanya berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'OTP berhasil dikirim ke email', otpToken });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Gagal mengirim email OTP. Pastikan konfigurasi EMAIL_USER benar.' });
  }
};

exports.sendMagicLink = async (req, res) => {
  try {
    const { full_name, email, phone_number, password } = req.body;
    if (!full_name || (!phone_number && !email) || !password) {
      return res.status(400).json({ error: 'Data registrasi tidak lengkap' });
    }
    
    // Check if phone number exists
    if (phone_number) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone_number: phone_number }
      });
      if (existingPhone) {
        return res.status(400).json({ error: 'Nomor HP ini sudah digunakan oleh akun lain' });
      }
    }
    
    // Check if email exists
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: email }
      });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email ini sudah terdaftar' });
      }
    }

    // Sign registration data into a JWT token (expires in 15 minutes)
    const magicToken = jwt.sign(
      { full_name, email, phone_number, password }, 
      JWT_SECRET, 
      { expiresIn: '15m' }
    );

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const magicLinkUrl = `https://handygo.id/verify-magic-link?token=${magicToken}`;

    const mailOptions = {
      from: `"HandyGo Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Tautan Ajaib (Magic Link) Pendaftaran HandyGo',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #034078;">Verifikasi Akun HandyGo</h2>
          <p>Halo ${full_name},</p>
          <p>Terima kasih telah mendaftar di HandyGo. Klik tombol di bawah ini untuk mengaktifkan akun Anda dan langsung masuk ke aplikasi:</p>
          <a href="${magicLinkUrl}" style="display: inline-block; padding: 14px 24px; font-size: 16px; color: #ffffff; background-color: #0ea5e9; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold;">
            Verifikasi Akun Saya
          </a>
          <p style="color: #64748b; font-size: 14px;">Tautan ini hanya berlaku selama 15 menit. Jika Anda tidak mendaftar di HandyGo, abaikan email ini.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Tautan ajaib berhasil dikirim ke email' });
  } catch (error) {
    console.error('Send Magic Link error:', error);
    res.status(500).json({ error: 'Gagal mengirim email tautan ajaib.' });
  }
};

exports.verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token tidak ditemukan' });
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Tautan sudah kedaluwarsa atau tidak valid' });
    }

    const { full_name, email, phone_number, password } = decoded;

    // Check if phone number exists
    if (phone_number) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone_number: phone_number }
      });
      if (existingPhone) {
        // If user already exists (maybe they clicked the link twice), just log them in
        const jwtToken = jwt.sign({ userId: existingPhone.id }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({
          message: 'Akun sudah terverifikasi',
          token: jwtToken,
          user: {
            id: existingPhone.id,
            full_name: existingPhone.full_name,
            phone_number: existingPhone.phone_number,
            email: existingPhone.email,
            default_location: existingPhone.default_location,
            profile_picture: existingPhone.profile_picture,
        role: existingPhone.role
          }
        });
      }
    }
    
    // Check if email exists
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: email }
      });
      if (existingEmail) {
        // If user already exists (maybe they clicked the link twice), just log them in
        const jwtToken = jwt.sign({ userId: existingEmail.id }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({
          message: 'Akun sudah terverifikasi',
          token: jwtToken,
          user: {
            id: existingEmail.id,
            full_name: existingEmail.full_name,
            phone_number: existingEmail.phone_number,
            email: existingEmail.email,
            default_location: existingEmail.default_location,
            profile_picture: existingEmail.profile_picture,
        role: existingEmail.role
          }
        });
      }
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

    // Generate login token
    const jwtToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Pendaftaran berhasil melalui Magic Link',
      token: jwtToken,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        phone_number: newUser.phone_number,
        email: newUser.email,
        default_location: newUser.default_location
      }
    });
  } catch (error) {
    console.error('Verify Magic Link error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memverifikasi tautan' });
  }
};
