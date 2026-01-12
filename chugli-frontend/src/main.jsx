// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { store } from "./app/store";
import { injectStore } from "@/api/axios";
import ErrorBoundary from "./components/common/ErrorBoundary";

import "./styles/index.css";

// 🔑 Inject store into axios
injectStore(store);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
