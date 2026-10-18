/**
 * ZAHRA (زهرة) Admin Dashboard - Controller
 * Direct Dashboard Access, Product CRUD, Image File Reader & LocalStorage Sync
 */

// Toast helper
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.remove('hidden', 'opacity-0', 'translate-y-2');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3500);
}

// Load and Render Dashboard Data
function loadDashboard() {
  const products = Store.getProducts();

  // Update Stats
  const totalProductsEl = document.getElementById('stat-total-products');
  const totalCategoriesEl = document.getElementById('stat-total-categories');
  const inStockEl = document.getElementById('stat-in-stock');

  if (totalProductsEl) totalProductsEl.textContent = products.length;
  if (totalCategoriesEl) {
    const cats = new Set(products.map(p => p.category));
    totalCategoriesEl.textContent = cats.size;
  }
  if (inStockEl) {
    const inStock = products.filter(p => p.inStock !== false).length;
    inStockEl.textContent = inStock;
  }

  // Render Table
  renderProductsTable(products);
}

// Render Products Table
function renderProductsTable(products) {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-gray-500">
          <div class="flex flex-col items-center">
            <span class="text-4xl mb-2">📦</span>
            <p class="text-base font-semibold text-gray-700">لا توجد منتجات معروضة حالياً</p>
            <p class="text-xs text-gray-400 mt-1">أضيفي منتجاً جديداً من النموذج بالأعلى أو اضغطي استعادة الافتراضي</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map((product, idx) => `
    <tr class="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
      <td class="px-4 py-3.5 text-xs text-gray-400 text-center font-mono">
        ${idx + 1}
      </td>
      <td class="px-4 py-3.5">
        <div class="flex items-center gap-3">
          <img src="${product.image}" alt="${product.name}" class="w-12 h-14 rounded-lg object-cover border border-gray-200 shadow-sm shrink-0" onerror="this.src='assets/images/hero-banner.jpg'">
          <div>
            <h4 class="font-bold text-sm text-gray-900 line-clamp-1">${product.name}</h4>
            <span class="text-[11px] text-gray-400 font-mono">ID: ${product.id}</span>
          </div>
        </div>
      </td>
      <td class="px-4 py-3.5">
        <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
          ${product.category}
        </span>
      </td>
      <td class="px-4 py-3.5">
        <div class="flex flex-col">
          <span class="font-bold text-sm text-emerald-950">${product.price} ج.م</span>
          ${product.originalPrice ? `<span class="text-xs text-gray-400 line-through">${product.originalPrice} ج.م</span>` : ''}
        </div>
      </td>
      <td class="px-4 py-3.5 text-center">
        <button onclick="toggleStockStatus('${product.id}')" class="px-2.5 py-1 rounded-full text-xs font-semibold ${product.inStock !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition hover:opacity-80">
          ${product.inStock !== false ? 'متوفر' : 'غير متوفر'}
        </button>
      </td>
      <td class="px-4 py-3.5 text-center">
        <div class="flex items-center justify-center gap-2">
          <button onclick="openEditModal('${product.id}')" class="p-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-900 hover:text-white transition shadow-sm" title="تعديل المنتج">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="confirmDeleteProduct('${product.id}', '${product.name.replace(/'/g, "\\'")}')" class="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition shadow-sm" title="حذف المنتج">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
          <a href="index.html#product-${product.id}" target="_blank" class="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gold hover:text-emerald-950 transition shadow-sm" title="معاينة في المتجر">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </a>
        </div>
      </td>
    </tr>
  `).join('');
}

// Toggle Stock
function toggleStockStatus(id) {
  const products = Store.getProducts();
  const product = products.find(p => p.id === id);
  if (product) {
    product.inStock = !product.inStock;
    Store.updateProduct(id, { inStock: product.inStock });
    loadDashboard();
    showToast(`تم تحديث حالة المنتج: ${product.inStock ? 'متوفر' : 'غير متوفر'}`);
  }
}

// Handle Add Product Submit
function handleAddProduct(e) {
  e.preventDefault();

  const name = document.getElementById('prod-name').value.trim();
  const category = document.getElementById('prod-category').value.trim();
  const price = document.getElementById('prod-price').value.trim();
  const originalPrice = document.getElementById('prod-original-price').value.trim();
  const description = document.getElementById('prod-desc').value.trim();
  const badge = document.getElementById('prod-badge').value.trim();
  
  // Image handling: file preview takes priority, else URL or default
  const imagePreview = document.getElementById('image-preview');
  let image = imagePreview && imagePreview.src && !imagePreview.src.includes('placeholder')
    ? imagePreview.src
    : document.getElementById('prod-image-url').value.trim() || 'assets/images/hero-banner.jpg';

  if (!name || !price) {
    alert('يرجى كتابة اسم المنتج وسعره.');
    return;
  }

  Store.addProduct({
    name,
    category,
    price,
    originalPrice,
    description,
    badge,
    image
  });

  // Reset form
  document.getElementById('add-product-form').reset();
  if (imagePreview) {
    imagePreview.src = '';
    imagePreview.classList.add('hidden');
  }

  loadDashboard();
  showToast('تمت إضافة المنتج بنجاح وتحديث المتجر فوراً! 🎉');
}

// File Upload Image Preview Converter
function handleImageFileUpload(e, targetPreviewId) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const previewEl = document.getElementById(targetPreviewId);
    if (previewEl) {
      previewEl.src = event.target.result;
      previewEl.classList.remove('hidden');
    }
  };
  reader.readAsDataURL(file);
}

// Edit Modal Functions
let currentEditingId = null;

function openEditModal(id) {
  const products = Store.getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  currentEditingId = id;
  document.getElementById('edit-prod-id').value = product.id;
  document.getElementById('edit-prod-name').value = product.name;
  document.getElementById('edit-prod-category').value = product.category;
  document.getElementById('edit-prod-price').value = product.price;
  document.getElementById('edit-prod-original-price').value = product.originalPrice || '';
  document.getElementById('edit-prod-desc').value = product.description || '';
  document.getElementById('edit-prod-badge').value = product.badge || '';
  document.getElementById('edit-prod-image-url').value = product.image;

  const preview = document.getElementById('edit-image-preview');
  if (preview) {
    preview.src = product.image;
    preview.classList.remove('hidden');
  }

  const modal = document.getElementById('edit-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeEditModal() {
  currentEditingId = null;
  const modal = document.getElementById('edit-modal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveEdit(e) {
  e.preventDefault();
  if (!currentEditingId) return;

  const name = document.getElementById('edit-prod-name').value.trim();
  const category = document.getElementById('edit-prod-category').value.trim();
  const price = document.getElementById('edit-prod-price').value.trim();
  const originalPrice = document.getElementById('edit-prod-original-price').value.trim();
  const description = document.getElementById('edit-prod-desc').value.trim();
  const badge = document.getElementById('edit-prod-badge').value.trim();

  const preview = document.getElementById('edit-image-preview');
  let image = preview && preview.src ? preview.src : document.getElementById('edit-prod-image-url').value.trim();

  Store.updateProduct(currentEditingId, {
    name,
    category,
    price,
    originalPrice,
    description,
    badge,
    image
  });

  closeEditModal();
  loadDashboard();
  showToast('تم حفظ التعديلات بنجاح! تم تحديث المتجر ✨');
}

// Delete Confirmation
function confirmDeleteProduct(id, name) {
  if (confirm(`هل أنتِ متأكدة من رغبتكِ في حذف المنتج "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
    Store.deleteProduct(id);
    loadDashboard();
    showToast(`تم حذف "${name}" بنجاح.`);
  }
}

// Reset Catalog
function handleResetDefaultCatalog() {
  if (confirm('هل ترغبين في استعادة التشكيلة الافتراضية الأصلية لعلامة زهرة (ZAHRA)؟ ستتم استعادة المنتجات الأساسية.')) {
    Store.resetDefaultProducts();
    loadDashboard();
    showToast('تمت استعادة التشكيلة الافتراضية بنجاح.');
  }
}

// Security & Credentials Configuration
const CREDENTIALS_STORAGE_KEY = 'zahra_admin_credentials';
const AUTH_SALT = '_zahra_salt_2026';
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'zahra2026';

// Cryptographic SHA-256 hash
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + AUTH_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get or initialize stored credentials
async function getAdminCredentials() {
  const stored = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.username && parsed.passwordHash) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse credentials, resetting to default.', e);
    }
  }

  // Set default credentials on first use
  const defaultHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  const initial = {
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash: defaultHash,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

// Authentication Functions
async function checkAuthStatus() {
  const isAuth = sessionStorage.getItem('zahra_admin_auth') === 'true';
  const loginSec = document.getElementById('login-section');
  const dashSec = document.getElementById('dashboard-section');
  const userBadge = document.getElementById('current-admin-user');

  if (isAuth) {
    if (loginSec) loginSec.classList.add('hidden');
    if (dashSec) dashSec.classList.remove('hidden');

    const creds = await getAdminCredentials();
    const currentName = sessionStorage.getItem('zahra_admin_user') || creds.username;

    if (userBadge) userBadge.textContent = currentName;

    loadDashboard();
  } else {
    if (dashSec) dashSec.classList.add('hidden');
    if (loginSec) loginSec.classList.remove('hidden');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const userEl = document.getElementById('admin-username');
  const passEl = document.getElementById('admin-password');
  const errorMsg = document.getElementById('login-error-msg');

  if (errorMsg) {
    errorMsg.classList.add('hidden');
    errorMsg.textContent = '';
  }

  const username = userEl ? userEl.value.trim() : '';
  const password = passEl ? passEl.value : '';

  if (!username || !password) {
    showLoginError('يرجى كتابة اسم المستخدم وكلمة المرور للمتابعة.');
    return;
  }

  const credentials = await getAdminCredentials();
  const enteredHash = await hashPassword(password);

  if (username === credentials.username && enteredHash === credentials.passwordHash) {
    sessionStorage.setItem('zahra_admin_auth', 'true');
    sessionStorage.setItem('zahra_admin_user', credentials.username);

    // Optional progressive sync with backend API if running on server
    try {
      fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.token) {
          sessionStorage.setItem('zahra_admin_jwt', data.token);
        }
      })
      .catch(() => {});
    } catch (e) {}

    if (userEl) userEl.value = '';
    if (passEl) passEl.value = '';

    showToast(`مرحباً بكِ (${credentials.username})، تم تسجيل الدخول بنجاح!`);
    await checkAuthStatus();
  } else {
    showLoginError('خطأ: اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.');
  }
}

function showLoginError(msg) {
  const errorMsg = document.getElementById('login-error-msg');
  if (errorMsg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  } else {
    showToast(msg, 'error');
  }
}

function handleLogout() {
  sessionStorage.removeItem('zahra_admin_auth');
  sessionStorage.removeItem('zahra_admin_user');

  const userEl = document.getElementById('admin-username');
  const passEl = document.getElementById('admin-password');
  if (userEl) userEl.value = '';
  if (passEl) passEl.value = '';

  closeCredentialsModal();
  showToast('تم تسجيل الخروج بنجاح.');
  checkAuthStatus();
}

function togglePasswordVisibility() {
  const passEl = document.getElementById('admin-password');
  if (!passEl) return;
  const isPass = passEl.type === 'password';
  passEl.type = isPass ? 'text' : 'password';
}

function toggleFieldPassword(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.type = field.type === 'password' ? 'text' : 'password';
  }
}

// Credentials Modal Controller (Secure, Toggleable, Protected)
function openCredentialsModal() {
  // Guard: Protect modal from unauthenticated users
  if (sessionStorage.getItem('zahra_admin_auth') !== 'true') {
    handleLogout();
    return;
  }

  const userBadge = document.getElementById('current-admin-user');
  const currentUsername = userBadge ? userBadge.textContent : (sessionStorage.getItem('zahra_admin_user') || 'admin');

  const newUsernameInput = document.getElementById('new-admin-username');
  if (newUsernameInput) newUsernameInput.value = currentUsername;

  const currPass = document.getElementById('current-admin-password');
  const newPass = document.getElementById('new-admin-password');
  const confPass = document.getElementById('confirm-admin-password');
  const alertEl = document.getElementById('credentials-alert');

  if (currPass) currPass.value = '';
  if (newPass) newPass.value = '';
  if (confPass) confPass.value = '';
  if (alertEl) {
    alertEl.className = 'hidden text-xs p-3.5 rounded-xl mb-4 font-medium';
    alertEl.textContent = '';
  }

  const modal = document.getElementById('credentials-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeCredentialsModal() {
  const modal = document.getElementById('credentials-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }

  // Clear sensitive password values on close
  const currPass = document.getElementById('current-admin-password');
  const newPass = document.getElementById('new-admin-password');
  const confPass = document.getElementById('confirm-admin-password');
  if (currPass) currPass.value = '';
  if (newPass) newPass.value = '';
  if (confPass) confPass.value = '';
}

// Close modal when pressing Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCredentialsModal();
  }
});

// Handle Credentials Update Form Submission with Strict Security Validation
async function handleChangeCredentials(e) {
  e.preventDefault();

  // 1. Guard check: authentication verification
  if (sessionStorage.getItem('zahra_admin_auth') !== 'true') {
    handleLogout();
    return;
  }

  const alertEl = document.getElementById('credentials-alert');
  const showAlert = (message, isError = true) => {
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.className = isError
      ? 'text-xs p-3.5 rounded-xl mb-4 font-medium bg-red-50 text-red-700 border border-red-200 block'
      : 'text-xs p-3.5 rounded-xl mb-4 font-medium bg-green-50 text-green-700 border border-green-200 block';
    alertEl.classList.remove('hidden');
  };

  const newUsername = document.getElementById('new-admin-username').value.trim();
  const currentPassword = document.getElementById('current-admin-password').value;
  const newPassword = document.getElementById('new-admin-password').value;
  const confirmPassword = document.getElementById('confirm-admin-password').value;

  if (!newUsername) {
    showAlert('يرجى كتابة اسم مستخدم جديد صالح.');
    return;
  }

  if (!currentPassword) {
    showAlert('يرجى إدخال كلمة المرور الحالية للتحقق من هويتكِ.');
    return;
  }

  // 2. Strict Security Check: Verify current password against stored cryptographic hash
  const credentials = await getAdminCredentials();
  const currentHash = await hashPassword(currentPassword);
  if (currentHash !== credentials.passwordHash) {
    showAlert('كلمة المرور الحالية غير صحيحة! يرجى التأكد وإعادة المحاولة.');
    return;
  }

  // 3. Validate new password
  if (newPassword.length < 6) {
    showAlert('كلمة المرور الجديدة يجب ألا تقل عن 6 خانات.');
    return;
  }

  if (newPassword !== confirmPassword) {
    showAlert('كلمة المرور الجديدة وتأكيدها غير متطابقين!');
    return;
  }

  // 4. Update credentials with new cryptographic hash (SHA-256 + Salt)
  const newHash = await hashPassword(newPassword);
  const nowIso = new Date().toISOString();
  const updatedCredentials = {
    username: newUsername,
    passwordHash: newHash,
    updatedAt: nowIso
  };

  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(updatedCredentials));
  sessionStorage.setItem('zahra_admin_user', newUsername);

  // Sync active UI username badge in header
  const userBadge = document.getElementById('current-admin-user');
  if (userBadge) userBadge.textContent = newUsername;

  // Progressive sync with backend API if running with active server
  try {
    const token = sessionStorage.getItem('zahra_admin_jwt');
    fetch('/api/admin/change-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ newUsername, currentPassword, newPassword, confirmPassword })
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data && data.token) {
        sessionStorage.setItem('zahra_admin_jwt', data.token);
      }
    })
    .catch(() => {});
  } catch (e) {}

  showAlert('تم تحديث بيانات الدخول وحفظها بأمان! ✨', false);
  showToast('تم حفظ اسم المستخدم وكلمة المرور الجديدة بنجاح! 🔒');

  setTimeout(() => {
    closeCredentialsModal();
  }, 1200);
}

// Setup Event Listeners on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check auth state on load
  checkAuthStatus();

  // Authentication listeners
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const togglePassBtn = document.getElementById('toggle-password-btn');
  if (togglePassBtn) togglePassBtn.addEventListener('click', togglePasswordVisibility);

  // Change credentials modal listeners
  const openCredsBtn = document.getElementById('open-change-password-btn');
  if (openCredsBtn) openCredsBtn.addEventListener('click', openCredentialsModal);

  const credsForm = document.getElementById('credentials-form');
  if (credsForm) credsForm.addEventListener('submit', handleChangeCredentials);

  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) addProductForm.addEventListener('submit', handleAddProduct);

  const editProductForm = document.getElementById('edit-product-form');
  if (editProductForm) editProductForm.addEventListener('submit', handleSaveEdit);

  const fileInput = document.getElementById('prod-image-file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => handleImageFileUpload(e, 'image-preview'));
  }

  const editFileInput = document.getElementById('edit-prod-image-file');
  if (editFileInput) {
    editFileInput.addEventListener('change', (e) => handleImageFileUpload(e, 'edit-image-preview'));
  }

  const searchInput = document.getElementById('admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const products = Store.getProducts();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
      renderProductsTable(filtered);
    });
  }

  // Preset Image Picker buttons
  document.querySelectorAll('.preset-img-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const imgPath = btn.getAttribute('data-img');
      const targetInput = document.getElementById('prod-image-url');
      const preview = document.getElementById('image-preview');
      if (targetInput) targetInput.value = imgPath;
      if (preview) {
        preview.src = imgPath;
        preview.classList.remove('hidden');
      }
    });
  });
});
