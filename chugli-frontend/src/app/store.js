import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@features/auth/authSlice";
import roomReducer from "@/features/room/roomSlice";
import chatReducer from "@/features/chat/chatSlice";
import uiReducer from "@/features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ["chat/addMessage", "chat/setMessages"],
        // Ignore these paths in the state
        ignoredPaths: ["chat.messages"],
      },
    }),
  devTools: import.meta.env.DEV,
});

// Export types for TypeScript users (optional but good practice)
export default store;
