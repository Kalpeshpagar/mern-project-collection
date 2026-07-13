import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";
import toast from "react-hot-toast";

// ── API calls ─────────────────────────────────────────────────────────────
export const fetchCategories = createAsyncThunk(
    "categories/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/categories", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch categories");
        }
    }
);

export const fetchCategoryById = createAsyncThunk(
    "categories/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch category");
        }
    }
);

export const createCategory = createAsyncThunk(
    "categories/create",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/categories", data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create category");
        }
    }
);

export const updateCategory = createAsyncThunk(
    "categories/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/categories/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update category");
        }
    }
);

export const deleteCategory = createAsyncThunk(
    "categories/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/categories/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete category");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────
const categorySlice = createSlice({
    name: "categories",
    initialState: {
        categories: [],
        category:   null,
        pagination: null,
        loading:    false,
        error:      null,
    },
    reducers: {
        clearCategory: (state) => { state.category = null; },
    },
    extraReducers: (builder) => {
        builder
            // fetchCategories
            .addCase(fetchCategories.pending,   (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading    = false;
                state.categories = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchCategories.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // fetchCategoryById
            .addCase(fetchCategoryById.pending,   (state) => { state.loading = true; })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.loading  = false;
                state.category = action.payload.data;
            })
            .addCase(fetchCategoryById.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // createCategory
            .addCase(createCategory.pending,   (state) => { state.loading = true; })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.unshift(action.payload.data);
                toast.success("Category created successfully!");
            })
            .addCase(createCategory.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // updateCategory
            .addCase(updateCategory.pending,   (state) => { state.loading = true; })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading    = false;
                state.category   = action.payload.data;
                state.categories = state.categories.map((c) =>
                    c._id === action.payload.data._id ? action.payload.data : c
                );
                toast.success("Category updated successfully!");
            })
            .addCase(updateCategory.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // deleteCategory
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter((c) => c._id !== action.payload);
                toast.success("Category deleted successfully!");
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                toast.error(action.payload);
            });
    },
});

export const { clearCategory } = categorySlice.actions;

// selectors
export const selectCategories          = (state) => state.categories.categories;
export const selectCategory            = (state) => state.categories.category;
export const selectCategoryPagination  = (state) => state.categories.pagination;
export const selectCategoryLoading     = (state) => state.categories.loading;

export default categorySlice.reducer;
