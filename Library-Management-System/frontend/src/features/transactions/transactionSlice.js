import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";
import toast from "react-hot-toast";

export const fetchTransactions = createAsyncThunk(
    "transactions/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/transactions", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch transactions");
        }
    }
);

export const fetchTransactionById = createAsyncThunk(
    "transactions/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/transactions/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch transaction");
        }
    }
);

export const issueBook = createAsyncThunk(
    "transactions/issue",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/transactions/issue", data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to issue book");
        }
    }
);

export const returnBook = createAsyncThunk(
    "transactions/return",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/transactions/${id}/return`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to return book");
        }
    }
);

export const renewBook = createAsyncThunk(
    "transactions/renew",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/transactions/${id}/renew`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to renew book");
        }
    }
);

export const fetchOverdueBooks = createAsyncThunk(
    "transactions/fetchOverdue",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/transactions/overdue", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch overdue books");
        }
    }
);

export const fetchMyBorrows = createAsyncThunk(
    "transactions/fetchMyBorrows",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/transactions/my", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch borrows");
        }
    }
);

const transactionSlice = createSlice({
    name: "transactions",
    initialState: {
        transactions: [],
        transaction:  null,
        overdue:      [],
        myBorrows:    [],
        pagination:   null,
        loading:      false,
        error:        null,
    },
    reducers: {
        clearTransaction: (state) => { state.transaction = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactions.pending,   (state) => { state.loading = true; })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading      = false;
                state.transactions = action.payload.data;
                state.pagination   = action.payload.pagination;
            })
            .addCase(fetchTransactions.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(fetchTransactionById.pending,   (state) => { state.loading = true; })
            .addCase(fetchTransactionById.fulfilled, (state, action) => {
                state.loading     = false;
                state.transaction = action.payload.data;
            })
            .addCase(fetchTransactionById.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(issueBook.pending,   (state) => { state.loading = true; })
            .addCase(issueBook.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions.unshift(action.payload.data);
                toast.success("Book issued successfully!");
            })
            .addCase(issueBook.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(returnBook.pending,   (state) => { state.loading = true; })
            .addCase(returnBook.fulfilled, (state, action) => {
                state.loading      = false;
                state.transaction  = action.payload.data;
                state.transactions = state.transactions.map((t) =>
                    t._id === action.payload.data._id ? action.payload.data : t
                );
                toast.success(action.payload.message);
            })
            .addCase(returnBook.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(renewBook.pending,   (state) => { state.loading = true; })
            .addCase(renewBook.fulfilled, (state, action) => {
                state.loading     = false;
                state.transaction = action.payload.data;
                toast.success(action.payload.message);
            })
            .addCase(renewBook.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(fetchOverdueBooks.pending,   (state) => { state.loading = true; })
            .addCase(fetchOverdueBooks.fulfilled, (state, action) => {
                state.loading  = false;
                state.overdue  = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchOverdueBooks.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(fetchMyBorrows.pending,   (state) => { state.loading = true; })
            .addCase(fetchMyBorrows.fulfilled, (state, action) => {
                state.loading    = false;
                state.myBorrows  = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchMyBorrows.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            });
    },
});

export const { clearTransaction } = transactionSlice.actions;

export const selectTransactions     = (state) => state.transactions.transactions;
export const selectTransaction      = (state) => state.transactions.transaction;
export const selectOverdueBooks     = (state) => state.transactions.overdue;
export const selectMyBorrows        = (state) => state.transactions.myBorrows;
export const selectTransactionPagination = (state) => state.transactions.pagination;
export const selectTransactionLoading    = (state) => state.transactions.loading;

export default transactionSlice.reducer;