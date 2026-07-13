import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";
import toast from "react-hot-toast";

// ── API calls ─────────────────────────────────────────────────────────────
export const fetchBooks = createAsyncThunk(
    "books/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/books", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch books");
        }
    }
);

export const fetchBookById = createAsyncThunk(
    "books/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/books/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch book");
        }
    }
);

export const addBook = createAsyncThunk(
    "books/add",
    async (bookData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/books", bookData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add book");
        }
    }
);

export const updateBook = createAsyncThunk(
    "books/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/books/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update book");
        }
    }
);

export const deleteBook = createAsyncThunk(
    "books/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/books/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete book");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────
const bookSlice = createSlice({
    name: "books",
    initialState: {
        books:      [],
        book:       null,    // single book for detail view
        pagination: null,
        loading:    false,
        error:      null,
    },
    reducers: {
        clearBook: (state) => { state.book = null; },
    },
    extraReducers: (builder) => {
        builder
            // fetchBooks
            .addCase(fetchBooks.pending,    (state) => { state.loading = true; state.error = null; })
            .addCase(fetchBooks.fulfilled,  (state, action) => {
                state.loading    = false;
                state.books      = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchBooks.rejected,   (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // fetchBookById
            .addCase(fetchBookById.pending,   (state) => { state.loading = true; })
            .addCase(fetchBookById.fulfilled, (state, action) => {
                state.loading = false;
                state.book    = action.payload.data;
            })
            .addCase(fetchBookById.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // addBook
            .addCase(addBook.pending,   (state) => { state.loading = true; })
            .addCase(addBook.fulfilled, (state, action) => {
                state.loading = false;
                state.books.unshift(action.payload.data);  // add to top of list
                toast.success("Book added successfully!");
            })
            .addCase(addBook.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // updateBook
            .addCase(updateBook.pending,   (state) => { state.loading = true; })
            .addCase(updateBook.fulfilled, (state, action) => {
                state.loading = false;
                state.book    = action.payload.data;
                // update in list if present
                state.books   = state.books.map((b) =>
                    b._id === action.payload.data._id ? action.payload.data : b
                );
                toast.success("Book updated successfully!");
            })
            .addCase(updateBook.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

            // deleteBook
            .addCase(deleteBook.fulfilled, (state, action) => {
                state.books = state.books.filter((b) => b._id !== action.payload);
                toast.success("Book deleted successfully!");
            })
            .addCase(deleteBook.rejected, (state, action) => {
                toast.error(action.payload);
            });
    },
});

export const { clearBook } = bookSlice.actions;

// selectors
export const selectBooks      = (state) => state.books.books;
export const selectBook       = (state) => state.books.book;
export const selectBookPagination = (state) => state.books.pagination;
export const selectBookLoading    = (state) => state.books.loading;

export default bookSlice.reducer;