import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";
import toast from "react-hot-toast";

export const fetchMembers = createAsyncThunk(
    "members/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/members", { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch members");
        }
    }
);

export const fetchMemberById = createAsyncThunk(
    "members/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/members/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch member");
        }
    }
);

export const createMember = createAsyncThunk(
    "members/create",
    async (memberData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/members", memberData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create member");
        }
    }
);

export const updateMember = createAsyncThunk(
    "members/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/members/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update member");
        }
    }
);

export const deactivateMember = createAsyncThunk(
    "members/deactivate",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/members/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to deactivate member");
        }
    }
);

export const fetchMemberHistory = createAsyncThunk(
    "members/fetchHistory",
    async ({ id, params }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/members/${id}/history`, { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch history");
        }
    }
);

const memberSlice = createSlice({
    name: "members",
    initialState: {
        members:    [],
        member:     null,
        history:    [],
        pagination: null,
        loading:    false,
        error:      null,
    },
    reducers: {
        clearMember: (state) => { state.member = null; state.history = []; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMembers.pending,   (state) => { state.loading = true; })
            .addCase(fetchMembers.fulfilled, (state, action) => {
                state.loading    = false;
                state.members    = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchMembers.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(fetchMemberById.pending,   (state) => { state.loading = true; })
            .addCase(fetchMemberById.fulfilled, (state, action) => {
                state.loading = false;
                state.member  = action.payload.data;
            })
            .addCase(fetchMemberById.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(createMember.pending,   (state) => { state.loading = true; })
            .addCase(createMember.fulfilled, (state, action) => {
                state.loading = false;
                state.members.unshift(action.payload.data);
                toast.success("Member created successfully!");
            })
            .addCase(createMember.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(updateMember.pending,   (state) => { state.loading = true; })
            .addCase(updateMember.fulfilled, (state, action) => {
                state.loading  = false;
                state.member   = action.payload.data;
                state.members  = state.members.map((m) =>
                    m._id === action.payload.data._id ? action.payload.data : m
                );
                toast.success("Member updated successfully!");
            })
            .addCase(updateMember.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            })

            .addCase(deactivateMember.fulfilled, (state, action) => {
                state.members = state.members.filter((m) => m._id !== action.payload);
                toast.success("Member deactivated successfully!");
            })
            .addCase(deactivateMember.rejected, (state, action) => {
                toast.error(action.payload);
            })

            .addCase(fetchMemberHistory.pending,   (state) => { state.loading = true; })
            .addCase(fetchMemberHistory.fulfilled, (state, action) => {
                state.loading  = false;
                state.history  = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchMemberHistory.rejected,  (state, action) => {
                state.loading = false;
                toast.error(action.payload);
            });
    },
});

export const { clearMember } = memberSlice.actions;

export const selectMembers        = (state) => state.members.members;
export const selectMember         = (state) => state.members.member;
export const selectMemberHistory  = (state) => state.members.history;
export const selectMemberPagination = (state) => state.members.pagination;
export const selectMemberLoading  = (state) => state.members.loading;

export default memberSlice.reducer;