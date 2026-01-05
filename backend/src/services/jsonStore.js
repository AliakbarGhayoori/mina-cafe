const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

// Use persistent disk if available, otherwise fallback to local data dir
const PERSISTENT_PATH = "/var/lib/data/db.json";
const LOCAL_PATH = path.join(__dirname, "..", "data", "db.json");
const DB_PATH = fs.existsSync("/var/lib/data") ? PERSISTENT_PATH : LOCAL_PATH;

// Ensure parent directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Simple ID generator
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// In-memory cache to reduce disk reads
let dbCache = null;
let cacheTime = 0;
const CACHE_TTL = 1000; // 1 second cache

// Read database with caching
const readDb = () => {
  const now = Date.now();
  if (dbCache && (now - cacheTime) < CACHE_TTL) {
    return dbCache;
  }

  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    dbCache = JSON.parse(data);
    cacheTime = now;
    return dbCache;
  } catch (err) {
    dbCache = { admins: [], users: [], categories: [], products: [] };
    cacheTime = now;
    return dbCache;
  }
};

// Write database with atomic write (write to temp file, then rename)
const writeDb = (data) => {
  const tempPath = DB_PATH + ".tmp";
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tempPath, DB_PATH);
  // Update cache
  dbCache = data;
  cacheTime = Date.now();
};

// Helper for targeted collection updates
const updateCollection = (collectionName, updateFn) => {
  const db = readDb();
  const result = updateFn(db[collectionName]);
  if (result.changed) {
    db[collectionName] = result.data;
    writeDb(db);
  }
  return result.value;
};

// Admin operations
const Admin = {
  async findOne(query) {
    const db = readDb();
    return db.admins.find((a) => {
      if (query.email) return a.email === query.email;
      if (query.id) return a.id === query.id;
      return false;
    });
  },

  async findById(id) {
    const db = readDb();
    return db.admins.find((a) => a.id === id);
  },

  async create({ email, password, name }) {
    const db = readDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = {
      id: generateId(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString(),
    };
    db.admins.push(admin);
    writeDb(db);
    return { id: admin.id, email: admin.email, name: admin.name };
  },

  async comparePassword(admin, password) {
    const db = readDb();
    const found = db.admins.find((a) => a.id === admin.id);
    if (!found) return false;
    return bcrypt.compare(password, found.password);
  },
};

// User operations (for OTP)
const User = {
  async findOne(query) {
    const db = readDb();
    return db.users.find((u) => {
      if (query.mobile) return u.mobile === query.mobile;
      if (query.id) return u.id === query.id;
      return false;
    });
  },

  async create(data) {
    const db = readDb();
    const user = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDb(db);
    return user;
  },

  async save(user) {
    const db = readDb();
    const index = db.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...user };
      writeDb(db);
    }
    return user;
  },
};

// Category operations
const Category = {
  async find() {
    const db = readDb();
    return db.categories.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  },

  async findById(id) {
    const db = readDb();
    return db.categories.find((c) => c.id === id);
  },

  async create(data) {
    const db = readDb();
    const category = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    db.categories.push(category);
    writeDb(db);
    return category;
  },

  async save(category) {
    const db = readDb();
    const index = db.categories.findIndex((c) => c.id === category.id);
    if (index !== -1) {
      db.categories[index] = { ...db.categories[index], ...category };
      writeDb(db);
      return db.categories[index];
    }
    return null;
  },

  async findByIdAndDelete(id) {
    const db = readDb();
    const index = db.categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      const deleted = db.categories.splice(index, 1)[0];
      writeDb(db);
      return deleted;
    }
    return null;
  },
};

// Product operations
const Product = {
  async find(query = {}, options = {}) {
    const db = readDb();
    let products = [...db.products];

    // Filter by status
    if (query.status) {
      products = products.filter((p) => p.status === query.status);
    }

    // Filter by category
    if (query.categoryId) {
      products = products.filter((p) => p.categoryId === query.categoryId);
    }

    // Filter by special
    if (query.special !== undefined) {
      products = products.filter((p) => p.special === query.special);
    }

    // Search
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      products = products.filter(
        (p) =>
          (p.titleEn && p.titleEn.toLowerCase().includes(searchLower)) ||
          (p.titleFa && p.titleFa.includes(query.search)) ||
          (p.descEn && p.descEn.toLowerCase().includes(searchLower)) ||
          (p.descFa && p.descFa.includes(query.search))
      );
    }

    // Sort: special first, then by orderingShowInList, then by createdAt desc
    products.sort((a, b) => {
      if (a.special !== b.special) return b.special ? 1 : -1;
      if ((a.orderingShowInList || 0) !== (b.orderingShowInList || 0)) {
        return (a.orderingShowInList || 0) - (b.orderingShowInList || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Pagination
    const total = products.length;
    if (options.skip) {
      products = products.slice(options.skip);
    }
    if (options.limit) {
      products = products.slice(0, options.limit);
    }

    // Populate category
    if (options.populate) {
      products = products.map((p) => {
        const category = db.categories.find((c) => c.id === p.categoryId);
        return {
          ...p,
          category: category
            ? { id: category.id, titleEn: category.titleEn, titleFa: category.titleFa, icon: category.icon }
            : null,
        };
      });
    }

    return { items: products, total };
  },

  async findById(id) {
    const db = readDb();
    return db.products.find((p) => p.id === id);
  },

  async create(data) {
    const db = readDb();
    const product = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    db.products.push(product);
    writeDb(db);
    return product;
  },

  async save(product) {
    const db = readDb();
    const index = db.products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...product };
      writeDb(db);
      return db.products[index];
    }
    return null;
  },

  async findByIdAndDelete(id) {
    const db = readDb();
    const index = db.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      const deleted = db.products.splice(index, 1)[0];
      writeDb(db);
      return deleted;
    }
    return null;
  },

  async countDocuments(query = {}) {
    const { total } = await this.find(query);
    return total;
  },

  async populate(product) {
    const db = readDb();
    const category = db.categories.find((c) => c.id === product.categoryId);
    return {
      ...product,
      category: category
        ? { id: category.id, titleEn: category.titleEn, titleFa: category.titleFa, icon: category.icon }
        : null,
    };
  },
};

module.exports = {
  Admin,
  User,
  Category,
  Product,
  generateId,
};
