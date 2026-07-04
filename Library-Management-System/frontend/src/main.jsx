import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import store from "./app/store.js";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        success: { style: { background: "#EAF3DE", color: "#3B6D11" } },
                        error:   { style: { background: "#FCEBEB", color: "#A32D2D" } },
                    }}
                />
            </BrowserRouter>
        </Provider>
    </StrictMode>
);