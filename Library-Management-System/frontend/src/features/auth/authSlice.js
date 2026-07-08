import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    loginAPI,
    logoutAPI,
    registerAPI,
    getCurrentUserAPI,
    updateProfileAPI,
    changePasswordAPI,
} from "./authAPI.js";
import toast from "react-hot-toast";

// ── Initial State ─────────────────────────────────────────────────────────
const initialState = {
    user:          null,       // logged-in user object
    isAuthenticated: false,    // is user logged in
    loading:       false,      // for login/register buttons
    profileLoading: false,     // for fetching current user on app load
    error:         null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────
// Each thunk handles one API call
// createAsyncThunk auto-generates pending/fulfilled/rejected actions

export const register = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const data = await registerAPI(userData);
            return data;
        } catch (error) {
            // rejectWithValue passes the error to the rejected action
            return rejectWithValue(
                error.response?.data?.message || "Registration failed"
            );
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const data = await loginAPI(credentials);
            // store token in localStorage for axiosInstance interceptor
            localStorage.setItem("accessToken", data.accessToken);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await logoutAPI();
            localStorage.removeItem("accessToken");
        } catch (error) {
            // even if API call fails, clear local state
            localStorage.removeItem("accessToken");
            return rejectWithValue(
                error.response?.data?.message || "Logout failed"
            );
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const data = await getCurrentUserAPI();
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch user"
            );
        }
    }
);

export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (profileData, { rejectWithValue }) => {
        try {
            const data = await updateProfileAPI(profileData);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Profile update failed"
            );
        }
    }
);

export const changePassword = createAsyncThunk(
    "auth/changePassword",
    async (passwordData, { rejectWithValue }) => {
        try {
            const data = await changePasswordAPI(passwordData);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Password change failed"
            );
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // synchronous action to clear errors
        clearError: (state) => {
            state.error = null;
        },
    },

    // extraReducers handles async thunk lifecycle:
    // pending   → request started
    // fulfilled → request succeeded
    // rejected  → request failed
    extraReducers: (builder) => {

        // ── register ──────────────────────────────────────────────────
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
                toast.success("Registered successfully! Please login.");
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

        // ── login ─────────────────────────────────────────────────────
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading          = false;
                state.user             = action.payload.user;
                state.isAuthenticated  = true;
                toast.success("Logged in successfully!");
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

        // ── logout ────────────────────────────────────────────────────
            .addCase(logout.fulfilled, (state) => {
                state.user            = null;
                state.isAuthenticated = false;
                toast.success("Logged out successfully!");
            })

        // ── fetchCurrentUser ──────────────────────────────────────────
        // called on app load to restore session from cookie
            .addCase(fetchCurrentUser.pending, (state) => {
                state.profileLoading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.profileLoading  = false;
                state.user            = action.payload.data;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.profileLoading  = false;
                state.user            = null;
                state.isAuthenticated = false;
            })

        // ── updateProfile ─────────────────────────────────────────────
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user    = action.payload.data;
                toast.success("Profile updated successfully!");
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            })

        // ── changePassword ────────────────────────────────────────────
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.loading = false;
                toast.success("Password changed successfully!");
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload;
                toast.error(action.payload);
            });
    },
});

export const { clearError } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────
// components use these to read from Redux state
// e.g. const user = useSelector(selectUser)
export const selectUser            = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading     = (state) => state.auth.loading;
export const selectProfileLoading  = (state) => state.auth.profileLoading;
export const selectAuthError       = (state) => state.auth.error;

export default authSlice.reducer;