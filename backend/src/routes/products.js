const express = require("express");
const { Product } = require("../services/jsonStore");
const { adminAuth } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

const router = express.Router();

// Public: list products with filtering & pagination
router.get("/", async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10, special } = req.query;

    const query = { status: "active" };
    if (category) {
      query.categoryId = category;
    }
    if (special === "true") {
      query.special = true;
    }
    if (search) {
      query.search = search;
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const { items, total } = await Product.find(query, {
      skip,
      limit: limitNum,
      populate: true,
    });

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
      price: Number(price),
      discount: Number(discount) || 0,
      status: status || "active",
      orderingShowInList: Number(orderingShowInList) || 0,
      special: special === "true" || special === true,
      categoryId: category,
      image: req.fileUrl || "",
    });

    const populated = await Product.populate(product);
    return res.status(201).json(populated);
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
    product.price = Number(price);
    product.discount = Number(discount) || 0;
    product.status = status;
    product.orderingShowInList = Number(orderingShowInList) || 0;
    product.special = special === "true" || special === true;
    product.categoryId = category;

    if (req.fileUrl) {
      product.image = req.fileUrl;
    }

    const saved = await Product.save(product);
    const populated = await Product.populate(saved);
    return res.json(populated);
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
