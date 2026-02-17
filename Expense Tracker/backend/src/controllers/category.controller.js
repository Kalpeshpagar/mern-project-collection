import Category from "../models/category.model.js";

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Duplicate category check
    const existingCategory = await Category.findOne({
      name,
      user: req.user._id
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name,
      user: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });

  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create category"
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories
    });

  } catch (error) {
    console.error("Fetch category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check category exists & belongs to user
    const category = await Category.findOne({
      _id: id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check duplicate name (exclude current category)
    const duplicate = await Category.findOne({
      name,
      user: req.user._id,
      _id: { $ne: id }  // “Ignore the current category”
                       // Prevents false duplicate conflict
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists"
      });
    }

    // Update category
    category.name = name;
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category"
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    //  Check category exists & belongs to user
    const category = await Category.findOne({
      _id: id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check if category is used by any expense
    const expenseExists = await Expense.exists({
      category: id,
      user: req.user._id
    });

    if (expenseExists) {
      return res.status(400).json({
        success: false,
        message:
          "Category is used by existing expenses. Please delete or reassign them first."
      });
    }

    // Safe to delete
    await Category.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category"
    });
  }
};

export { createCategory, getCategories, updateCategory, deleteCategory };
