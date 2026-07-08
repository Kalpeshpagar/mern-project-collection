import mongoose from "mongoose";
import { Author } from "../models/author.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── GET ALL AUTHORS ───────────────────────────────────────────────────────
const getAllAuthors = asyncHandler(async (req, res) => {
    const {
        search,
        page  = 1,
        limit = 20,
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

    const [authors, total] = await Promise.all([
        Author.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .select("-__v"),
        Author.countDocuments(query),
    ]);

    return res.status(200).json({
        success: true,
        data: authors,
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

// ── GET AUTHOR BY ID ──────────────────────────────────────────────────────
const getAuthorById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid author ID" });
    }

    const author = await Author.findById(id).select("-__v");
    if (!author) {
        return res.status(404).json({ success: false, message: "Author not found" });
    }

    return res.status(200).json({ success: true, data: author });
});

// ── CREATE AUTHOR ─────────────────────────────────────────────────────────
const createAuthor = asyncHandler(async (req, res) => {
    const { name, bio, photo, country } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Author name is required" });
    }

    // Check duplicate name (case-insensitive)
    const existing = await Author.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } });
    if (existing) {
        return res.status(409).json({ success: false, message: "An author with this name already exists" });
    }

    const author = await Author.create({
        name:    name.trim(),
        bio:     bio     || "",
        photo:   photo   || "",
        country: country || "",
    });

    return res.status(201).json({
        success: true,
        message: "Author created successfully",
        data:    author,
    });
});

// ── UPDATE AUTHOR ─────────────────────────────────────────────────────────
const updateAuthor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid author ID" });
    }

    const author = await Author.findById(id);
    if (!author) {
        return res.status(404).json({ success: false, message: "Author not found" });
    }

    const { name, bio, photo, country } = req.body;

    // Check duplicate name if name is being changed
    if (name && name.trim() !== author.name) {
        const existing = await Author.findOne({
            name: { $regex: `^${name.trim()}$`, $options: "i" },
            _id:  { $ne: id },
        });
        if (existing) {
            return res.status(409).json({ success: false, message: "An author with this name already exists" });
        }
    }

    const updateFields = {
        ...(name    !== undefined && { name:    name.trim() }),
        ...(bio     !== undefined && { bio }),
        ...(photo   !== undefined && { photo }),
        ...(country !== undefined && { country }),
    };

    const updated = await Author.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select("-__v");

    return res.status(200).json({
        success: true,
        message: "Author updated successfully",
        data:    updated,
    });
});

// ── DELETE AUTHOR ─────────────────────────────────────────────────────────
const deleteAuthor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid author ID" });
    }

    const author = await Author.findById(id);
    if (!author) {
        return res.status(404).json({ success: false, message: "Author not found" });
    }

    await Author.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "Author deleted successfully",
    });
});

export { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };
