import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Provider } from "react-redux";
import { store } from "./app/store.js";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <PrimeReactProvider value={{ unstyled: false }}>
            <Provider store={store}>
                <App />
            </Provider>
        </PrimeReactProvider>
    </StrictMode>
);
