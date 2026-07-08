import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── GET ALL CATEGORIES ────────────────────────────────────────────────────
const getAllCategories = asyncHandler(async (req, res) => {
    const {
        search,
        page  = 1,
        limit = 50,
        sortBy = "name",
        order  = "asc",
    } = req.query;

    const query = {};

    if (search) {
        query.name = { $regex: search, $options: "i" };
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj   = { [sortBy]: sortOrder };

    const [categories, total] = await Promise.all([
        Category.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .select("-__v"),
        Category.countDocuments(query),
    ]);

    return res.status(200).json({
        success: true,
        data: categories,
        pagination: {
            total,
            page:       pageNum,
            limit:      limitNum,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1,
        },
    });
});

// ── GET CATEGORY BY ID ────────────────────────────────────────────────────
const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const category = await Category.findById(id).select("-__v");
    if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({ success: true, data: category });
});

// ── CREATE CATEGORY ───────────────────────────────────────────────────────
const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Category name is required" });
    }

    // The schema already has `unique: true` on name, but we give a friendlier message
    const existing = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } });
    if (existing) {
        return res.status(409).json({ success: false, message: "A category with this name already exists" });
    }

    const category = await Category.create({
        name:        name.trim(),
        description: description || "",
    });

    return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data:    category,
    });
});

// ── UPDATE CATEGORY ───────────────────────────────────────────────────────
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }

    const { name, description } = req.body;

    // Check duplicate name if name is being changed
    if (name && name.trim() !== category.name) {
        const existing = await Category.findOne({
            name: { $regex: `^${name.trim()}$`, $options: "i" },
            _id:  { $ne: id },
        });
        if (existing) {
            return res.status(409).json({ success: false, message: "A category with this name already exists" });
        }
    }

    const updateFields = {
        ...(name        !== undefined && { name:        name.trim() }),
        ...(description !== undefined && { description }),
    };

    const updated = await Category.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select("-__v");

    return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data:    updated,
    });
});

// ── DELETE CATEGORY ───────────────────────────────────────────────────────
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
    });
});

export { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
