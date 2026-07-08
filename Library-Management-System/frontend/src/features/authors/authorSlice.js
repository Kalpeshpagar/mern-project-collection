import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";
import toast from "react-hot-toast";

// ── API calls ─────────────────────────────────────────────────────────────
export const fetchAuthors = createAsyncThunk(
    "authors/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/authors", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch authors");
        }
    }
);

export const fetchAuthorById = createAsyncThunk(
    "authors/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/authors/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch author");
        }
    }
);

export const createAuthor = createAsyncThunk(
    "authors/create",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/authors", data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create author");
        }
    }
);

export const updateAuthor = createAsyncThunk(
    "authors/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/authors/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update author");
        }
    }
);

export const deleteAuthor = createAsyncThunk(
    "authors/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/authors/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete author");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────
const authorSlice = createSlice({
    name: "authors",
    initialState: {
        authors:    [],
        author:     null,
        pagination: null,
        loading:    false,
        error:      null,
    },
    reducers: {
        clearAuthor: (state) => { state.author = null; },
    },
    extraReducers: (builder) => {
        builder
            // fetchAuthors
            .addCase(fetchAuthors.pending,   (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAuthors.fulfilled, (state, action) => {
                state.loading    = false;
                state.authors    = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchAuthors.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // fetchAuthorById
            .addCase(fetchAuthorById.pending,   (state) => { state.loading = true; })
            .addCase(fetchAuthorById.fulfilled, (state, action) => {
                state.loading = false;
                state.author  = action.payload.data;
            })
            .addCase(fetchAuthorById.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // createAuthor
            .addCase(createAuthor.pending,   (state) => { state.loading = true; })
            .addCase(createAuthor.fulfilled, (state, action) => {
                state.loading = false;
                state.authors.unshift(action.payload.data);
                toast.success("Author created successfully!");
            })
            .addCase(createAuthor.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // updateAuthor
            .addCase(updateAuthor.pending,   (state) => { state.loading = true; })
            .addCase(updateAuthor.fulfilled, (state, action) => {
                state.loading = false;
                state.author  = action.payload.data;
                state.authors = state.authors.map((a) =>
                    a._id === action.payload.data._id ? action.payload.data : a
                );
                toast.success("Author updated successfully!");
            })
            .addCase(updateAuthor.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // deleteAuthor
            .addCase(deleteAuthor.fulfilled, (state, action) => {
                state.authors = state.authors.filter((a) => a._id !== action.payload);
                toast.success("Author deleted successfully!");
            })
            .addCase(deleteAuthor.rejected, (state, action) => {
                toast.error(action.payload);
            });
    },
});

export const { clearAuthor } = authorSlice.actions;

// selectors
export const selectAuthors         = (state) => state.authors.authors;
export const selectAuthor          = (state) => state.authors.author;
export const selectAuthorPagination = (state) => state.authors.pagination;
export const selectAuthorLoading    = (state) => state.authors.loading;

export default authorSlice.reducer;
