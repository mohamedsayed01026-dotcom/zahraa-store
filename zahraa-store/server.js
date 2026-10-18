/**
 * ZAHRA (زهرة) - Secure Admin Authentication Server
 * Backend API for Admin Credential Management & Storefront Serving
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'zahra_luxury_secret_jwt_key_2026';
const CONFIG_PATH = path.join(__dirname, 'config', 'admin_credentials.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Helper: Hashing password securely using PBKDF2 (built-in crypto, zero external dependency required)
function hashPasswordPBKDF2(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });
}

// Load or Initialize Credentials from config file
async function getAdminConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      const initialSalt = crypto.randomBytes(16).toString('hex');
      const initialHash = await hashPasswordPBKDF2('zahra2026', initialSalt);
      const initialConfig = {
        username: 'admin',
        salt: initialSalt,
        passwordHash: initialHash,
        updatedAt: new Date().toISOString(),
        role: 'super_admin'
      };
      fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(initialConfig, null, 2), 'utf-8');
      return initialConfig;
    }

    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(data);

    // If config has no salt (initial dummy hash), initialize with proper salt & PBKDF2
    if (!parsed.salt) {
      parsed.salt = crypto.randomBytes(16).toString('hex');
      parsed.passwordHash = await hashPasswordPBKDF2('zahra2026', parsed.salt);
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (err) {
    console.error('Error reading admin credentials config:', err);
    throw new Error('فشل قراءة ملف إعدادات الأدمن');
  }
}

// Save Credentials to config file
function saveAdminConfig(config) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// Simple signed token generator
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

// Verify token
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null; // expired
    return payload;
  } catch (e) {
    return null;
  }
}

// Middleware: Authentication Guard (Protects admin actions)
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح: يجب تسجيل الدخول كمدير لتنفيذ هذا الإجراء.'
    });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.username) {
    return res.status(403).json({
      success: false,
      message: 'الجلسة منتهية أو غير صالحة. يرجى تسجيل الدخول مجدداً.'
    });
  }

  req.admin = payload;
  next();
}

// --- API ROUTES ---

// 1. Admin Login Endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إرسال اسم المستخدم وكلمة المرور.' });
    }

    const config = await getAdminConfig();
    const enteredHash = await hashPasswordPBKDF2(password, config.salt);

    if (username.trim().toLowerCase() === config.username.toLowerCase() && enteredHash === config.passwordHash) {
      const token = generateToken({ username: config.username, role: 'super_admin' });
      return res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح.',
        token,
        admin: {
          username: config.username,
          updatedAt: config.updatedAt
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'خطأ: اسم المستخدم أو كلمة المرور غير صحيحة.'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'خطأ في معالجة تسجيل الدخول.' });
  }
});

// 2. Get Admin Status (Protected)
app.get('/api/admin/status', requireAdminAuth, async (req, res) => {
  try {
    const config = await getAdminConfig();
    res.json({
      success: true,
      username: config.username,
      updatedAt: config.updatedAt,
      role: config.role || 'super_admin'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'تعذر جلب حالة الحساب.' });
  }
});

// 3. Change Credentials Endpoint (Protected by requireAdminAuth)
app.post('/api/admin/change-credentials', requireAdminAuth, async (req, res) => {
  try {
    const { newUsername, currentPassword, newPassword, confirmPassword } = req.body;

    // Field Validations
    if (!newUsername || !newUsername.trim()) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم الجديد مطلوب.' });
    }

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'كلمة المرور الحالية مطلوبة للتحقق الأمني.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 خانات.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين.' });
    }

    const config = await getAdminConfig();

    // 1. Verify Current Password
    const currentHash = await hashPasswordPBKDF2(currentPassword, config.salt);
    if (currentHash !== config.passwordHash) {
      return res.status(403).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة! يرجى التأكد وإعادة المحاولة.'
      });
    }

    // 2. Generate new cryptographic salt & hash for the new password
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = await hashPasswordPBKDF2(newPassword, newSalt);
    const nowIso = new Date().toISOString();

    // 3. Save new configuration
    config.username = newUsername.trim();
    config.salt = newSalt;
    config.passwordHash = newHash;
    config.updatedAt = nowIso;

    saveAdminConfig(config);

    // 4. Issue a refreshed token for the new credentials
    const newToken = generateToken({ username: config.username, role: 'super_admin' });

    res.json({
      success: true,
      message: 'تم تحديث وحفظ بيانات الدخول بنجاح! 🔒',
      token: newToken,
      admin: {
        username: config.username,
        updatedAt: nowIso
      }
    });
  } catch (err) {
    console.error('Error changing credentials:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم أثناء تحديث بيانات الدخول.' });
  }
});

// Default Fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🌸 ZAHRA Store Server is running on port ${PORT}`);
  console.log(`🛒 Storefront:  http://localhost:${PORT}/index.html`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`===============================================`);
});
