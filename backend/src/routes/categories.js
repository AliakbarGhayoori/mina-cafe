const express = require("express");
const { Category } = require("../models");
const { adminAuth } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

const router = express.Router();

// Public: list categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    return res.json(categories);
  } catch (err) {
    return next(err);
  }
});

// Admin: create category
router.post("/", adminAuth, uploadImage("image"), async (req, res, next) => {
  try {
    const { titleEn, titleFa, descEn, descFa, icon } = req.body;
    const category = await Category.create({ 
      titleEn, 
      titleFa, 
      descEn, 
      descFa, 
      icon: req.fileUrl || icon || "" 
    });
    return res.status(201).json(category);
  } catch (err) {
    return next(err);
  }
});

// Admin: update category
router.put("/:id", adminAuth, uploadImage("image"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titleEn, titleFa, descEn, descFa, icon } = req.body;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    category.titleEn = titleEn;
    category.titleFa = titleFa;
    category.descEn = descEn;
    category.descFa = descFa;
    if (req.fileUrl) {
      category.icon = req.fileUrl;
    } else if (icon !== undefined) {
      category.icon = icon;
    }
    await category.save();
    return res.json(category);
  } catch (err) {
    return next(err);
  }
});

// Admin: delete category
router.delete("/:id", adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.json({ message: "Category deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
