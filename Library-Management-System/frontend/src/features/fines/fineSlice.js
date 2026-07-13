import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";
import toast from "react-hot-toast";

export const fetchFines = createAsyncThunk(
    "fines/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/fines", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch fines");
        }
    }
);

export const fetchFineById = createAsyncThunk(
    "fines/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/fines/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch fine");
        }
    }
);

export const markFinePaid = createAsyncThunk(
    "fines/markPaid",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/fines/${id}/pay`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to mark fine as paid");
        }
    }
);

export const waiveFine = createAsyncThunk(
    "fines/waive",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/fines/${id}/waive`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to waive fine");
        }
    }
);

export const fetchMyFines = createAsyncThunk(
    "fines/fetchMyFines",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/fines/my", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch your fines");
        }
    }
);

const fineSlice = createSlice({
    name: "fines",
    initialState: {
        fines:      [],
        fine:       null,
        myFines:    [],
        summary:    null,
        pagination: null,
        loading:    false,
        error:      null,
    },
    reducers: {
        clearFine: (state) => { state.fine = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFines.pending,   (state) => { state.loading = true; })
            .addCase(fetchFines.fulfilled, (state, action) => {
                state.loading    = false;
                state.fines      = action.payload.data;
                state.summary    = action.payload.summary;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchFines.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(fetchFineById.pending,   (state) => { state.loading = true; })
            .addCase(fetchFineById.fulfilled, (state, action) => {
                state.loading = false;
                state.fine    = action.payload.data;
            })
            .addCase(fetchFineById.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(markFinePaid.pending,   (state) => { state.loading = true; })
            .addCase(markFinePaid.fulfilled, (state, action) => {
                state.loading = false;
                state.fine    = action.payload.data;
                state.fines   = state.fines.map((f) =>
                    f._id === action.payload.data._id ? action.payload.data : f
                );
                toast.success(action.payload.message);
            })
            .addCase(markFinePaid.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(waiveFine.pending,   (state) => { state.loading = true; })
            .addCase(waiveFine.fulfilled, (state, action) => {
                state.loading = false;
                state.fine    = action.payload.data;
                state.fines   = state.fines.map((f) =>
                    f._id === action.payload.data._id ? action.payload.data : f
                );
                toast.success(action.payload.message);
            })
            .addCase(waiveFine.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(fetchMyFines.pending,   (state) => { state.loading = true; })
            .addCase(fetchMyFines.fulfilled, (state, action) => {
                state.loading  = false;
                state.myFines  = action.payload.data;
                state.summary  = action.payload.summary;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchMyFines.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            });
    },
});

export const { clearFine } = fineSlice.actions;

export const selectFines       = (state) => state.fines.fines;
export const selectFine        = (state) => state.fines.fine;
export const selectMyFines     = (state) => state.fines.myFines;
export const selectFineSummary = (state) => state.fines.summary;
export const selectFinePagination = (state) => state.fines.pagination;
export const selectFineLoading    = (state) => state.fines.loading;

export default fineSlice.reducer;