import { configureStore } from "@reduxjs/toolkit";
import layoutReducer from "../layouts/layoutSlice";

export const store = configureStore({
    reducer: {
        layout: layoutReducer,
    },
});

export default store;
