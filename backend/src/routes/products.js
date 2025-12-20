const express = require("express");
const { Product, Category } = require("../models");
const { adminAuth } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

const router = express.Router();

// Public: list products with filtering & pagination
router.get("/", async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10, special } = req.query;

    const where = { status: "active" };
    if (category) {
      where.categoryId = category;
    }
    if (special === "true") {
      where.special = true;
    }
    if (search) {
      where.$or = [
        { titleEn: { $regex: search, $options: "i" } },
        { titleFa: { $regex: search, $options: "i" } },
        { descEn: { $regex: search, $options: "i" } },
        { descFa: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(where)
        .populate("categoryId", "titleEn titleFa icon")
        .sort({ special: -1, orderingShowInList: 1, createdAt: -1 })
        .limit(limitNum)
        .skip(skip),
      Product.countDocuments(where),
    ]);

    return res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return next(err);
  }
});

// Admin: create product
router.post("/", adminAuth, uploadImage("image"), async (req, res, next) => {
  try {
    const {
      titleEn,
      titleFa,
      descEn,
      descFa,
      price,
      discount,
      status,
      orderingShowInList,
      special,
      category,
    } = req.body;

    const product = await Product.create({
      titleEn,
      titleFa,
      descEn,
      descFa,
      price,
      discount,
      status,
      orderingShowInList,
      special,
      categoryId: category,
      image: req.fileUrl || "",
    });

    // Populate category
    await product.populate("categoryId", "titleEn titleFa icon");

    return res.status(201).json(product);
  } catch (err) {
    return next(err);
  }
});

// Admin: update product
router.put("/:id", adminAuth, uploadImage("image"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      titleEn,
      titleFa,
      descEn,
      descFa,
      price,
      discount,
      status,
      orderingShowInList,
      special,
      category,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.titleEn = titleEn;
    product.titleFa = titleFa;
    product.descEn = descEn;
    product.descFa = descFa;
    product.price = price;
    product.discount = discount;
    product.status = status;
    product.orderingShowInList = orderingShowInList;
    product.special = special;
    product.categoryId = category;

    if (req.fileUrl) {
      product.image = req.fileUrl;
    }

    await product.save();

    // Populate category
    await product.populate("categoryId", "titleEn titleFa icon");

    return res.json(product);
  } catch (err) {
    return next(err);
  }
});

// Admin: delete product
router.delete("/:id", adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
