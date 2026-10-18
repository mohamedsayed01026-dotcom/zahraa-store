/**
 * ZAHRA (زهرة) Store - Shared State & Storage Engine
 * Manages products, categories, cart, and WhatsApp integration
 */

const WHATSAPP_NUMBER = "201050951653";
const WHATSAPP_DISPLAY = "01050951653";
const FACEBOOK_LINK = "https://www.facebook.com/share/1BB6dre7mp/";
const TELEGRAM_LINK = "https://t.me/z010322";
const TIKTOK_LINK = "https://www.tiktok.com/@zahra.hijab0?_r=1&_t=ZS-9AZy7uz3Zw5";

// Default Initial Catalog for ZAHRA (زهرة)
const DEFAULT_PRODUCTS = [
  {
    id: "zahra-001",
    name: "عباية زهرة الملكية بالتطريز الذهبي",
    category: "عبايات",
    price: 850,
    originalPrice: 1100,
    image: "assets/images/hero-banner.jpg",
    description: "عباية ملكية فاخرة مصنوعة من خامة حرير المدينة الفاخر مع تطريز قصب ذهبي يدوي بارز على الأكمام وحاشية العباية، توفر انسيابية ووقاراً استثنائياً.",
    badge: "الأكثر مبيعاً",
    rating: 5,
    inStock: true,
    createdAt: "2026-10-01"
  },
  {
    id: "zahra-002",
    name: "إسدال الروضة الوارفة بالدانتيل العاجي",
    category: "إسدالات الصلاة",
    price: 420,
    originalPrice: 520,
    image: "assets/images/cat-prayer.jpg",
    description: "ثوب صلاة واسع وساتر ومصنوع من قطن الريون الطبيعي المعالج والبارد، مزين بدانتيل عاجي راقٍ على الأكمام، يمنحكِ الراحة التامة والسكينة.",
    badge: "أعلى تقييم",
    rating: 5,
    inStock: true,
    createdAt: "2026-10-01"
  },
  {
    id: "zahra-003",
    name: "طقم شالات حرير المدينة الفاخرة",
    category: "طرح وشالات",
    price: 260,
    originalPrice: 340,
    image: "assets/images/cat-hijabs.jpg",
    description: "مجموعة من 3 شالات حريرية متدرجة الألوان بتوليفة أنثوية ساحرة تجمع الزمردي والوردي الهادئ والبيج اللؤلؤي، ثابتة ومريحة طوال اليوم.",
    badge: "طقم حصري",
    rating: 5,
    inStock: true,
    createdAt: "2026-10-02"
  },
  {
    id: "zahra-004",
    name: "فستان زهرة المحتشم الكاجوال",
    category: "أزياء محتشمة",
    price: 550,
    originalPrice: 680,
    image: "assets/images/cat-casual.jpg",
    description: "فستان ماكسي يومي أنيق بتصميم محتشم يجمع لونين متناغمين من درجات الوردي الهادئ والكريمي، عملي للعمل والمناسبات اليومية بقصة انسيابية ومريحة.",
    badge: "وصل حديثاً",
    rating: 4.9,
    inStock: true,
    createdAt: "2026-10-02"
  },
  {
    id: "zahra-005",
    name: "عباية السهرة المخملية الفاخرة",
    category: "عبايات",
    price: 950,
    originalPrice: 1200,
    image: "assets/images/cat-abayas.jpg",
    description: "تصميم ملكي خاص للمناسبات والسهرات يجمع بين المخمل السويسري والتطريز المذهب الدقيق، تمنح حضوركِ فخامة وأناقة تليق بكِ.",
    badge: "إصدار خاص",
    rating: 5,
    inStock: true,
    createdAt: "2026-10-03"
  },
  {
    id: "zahra-006",
    name: "إسدال صلاة مريم بطرحة متصلة",
    category: "إسدالات الصلاة",
    price: 380,
    originalPrice: 460,
    image: "assets/images/cat-prayer.jpg",
    description: "إسدال ناعم منسوج من ألياف القطن والمودال البارد مع طرحة متصلة وسحاب مخفي، سهل وعملي جداً في الارتداء مع تطريز ناعم.",
    badge: "عملي جداً",
    rating: 4.8,
    inStock: true,
    createdAt: "2026-10-03"
  }
];

// Product Store API
const Store = {
  // Get all products (from localStorage or default)
  getProducts: function() {
    try {
      const stored = localStorage.getItem('zahra_products') || localStorage.getItem('zahraa_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading products:", e);
    }
    // Initialize with default
    this.saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  },

  // Save all products
  saveProducts: function(products) {
    try {
      localStorage.setItem('zahra_products', JSON.stringify(products));
      localStorage.setItem('zahraa_products', JSON.stringify(products)); // keep synced
      window.dispatchEvent(new Event('zahra_products_updated'));
      window.dispatchEvent(new Event('zahraa_products_updated'));
      return true;
    } catch (e) {
      console.error("Error saving products:", e);
      return false;
    }
  },

  // Add new product
  addProduct: function(productData) {
    const products = this.getProducts();
    const newProduct = {
      id: "zahra-" + Date.now().toString(36),
      name: productData.name.trim(),
      category: productData.category || "عام",
      price: parseFloat(productData.price) || 0,
      originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
      image: productData.image || "assets/images/hero-banner.jpg",
      description: productData.description || "",
      badge: productData.badge || "جديد",
      rating: productData.rating || 5,
      inStock: productData.inStock !== false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  // Update existing product
  updateProduct: function(id, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;

    products[index] = {
      ...products[index],
      ...updatedData,
      price: parseFloat(updatedData.price) || products[index].price,
      originalPrice: updatedData.originalPrice ? parseFloat(updatedData.originalPrice) : null
    };

    this.saveProducts(products);
    return products[index];
  },

  // Delete product
  deleteProduct: function(id) {
    let products = this.getProducts();
    const initialLen = products.length;
    products = products.filter(p => p.id !== id);
    if (products.length !== initialLen) {
      this.saveProducts(products);
      return true;
    }
    return false;
  },

  // Reset to initial default products
  resetDefaultProducts: function() {
    this.saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  },

  // Shopping Cart Management
  getCart: function() {
    try {
      const stored = localStorage.getItem('zahra_cart') || localStorage.getItem('zahraa_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart: function(cart) {
    try {
      localStorage.setItem('zahra_cart', JSON.stringify(cart));
      localStorage.setItem('zahraa_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('zahra_cart_updated'));
      window.dispatchEvent(new Event('zahraa_cart_updated'));
    } catch (e) {}
  },

  addToCart: function(product, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: quantity
      });
    }
    this.saveCart(cart);
    return cart;
  },

  removeFromCart: function(id) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== id);
    this.saveCart(cart);
    return cart;
  },

  updateCartQuantity: function(id, quantity) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
    }
    this.saveCart(cart);
    return cart;
  },

  clearCart: function() {
    this.saveCart([]);
  },

  // Generate WhatsApp Order URL
  getWhatsAppOrderUrl: function(product, customMessage = "") {
    let text = "";
    if (product) {
      text = `السلام عليكم ورحمة الله وبركاته،\nأود طلب المنتج التالي من متجر ZAHRA (زهرة):\n\n` +
             `🏷️ اسم المنتج: ${product.name}\n` +
             `💰 السعر: ${product.price} ج.م\n` +
             `🔖 كود المنتج: ${product.id}\n` +
             `📌 القسم: ${product.category}\n\n` +
             `يرجى تأكيد التوافر وطريقة الشحن والتوصيل. شكراً جزيلاً!`;
    } else if (customMessage) {
      text = customMessage;
    } else {
      text = `السلام عليكم ورحمة الله وبركاته،\nأود الاستفسار عن منتجات وتشكيلات علامة ZAHRA (زهرة) للأزياء.`;
    }
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  },

  // Generate Cart WhatsApp Order URL
  getCartWhatsAppOrderUrl: function() {
    const cart = this.getCart();
    if (cart.length === 0) {
      return `https://wa.me/${WHATSAPP_NUMBER}`;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let itemsText = cart.map((item, idx) => 
      `${idx + 1}. ${item.name} (${item.quantity} قطعة) - ${item.price * item.quantity} ج.م`
    ).join("\n");

    const text = `السلام عليكم ورحمة الله وبركاته،\nأود إتمام طلب سلة المشتريات من متجر ZAHRA (زهرة):\n\n` +
                 `🛒 تفاصيل المنتجات المطلوبة:\n${itemsText}\n\n` +
                 `💵 الإجمالي الكلي: ${total} ج.م\n\n` +
                 `يرجى تأكيد استلام الطلب وتحديد موعد التوصيل وعنوان الاستلام. شكراً لكم!`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }
};
