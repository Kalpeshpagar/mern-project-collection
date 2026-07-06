import { configureStore } from "@reduxjs/toolkit";
import authReducer        from "../features/auth/authSlice.js";
import bookReducer        from "../features/books/bookSlice.js";
import memberReducer      from "../features/members/memberSlice.js";
import transactionReducer from "../features/transactions/transactionSlice.js";
import fineReducer        from "../features/fines/fineSlice.js";

const store = configureStore({
    reducer: {
        auth:         authReducer,
        books:        bookReducer,
        members:      memberReducer,
        transactions: transactionReducer,
        fines:        fineReducer,
    },
});

export default store;