// src/app/hooks.js

import { useDispatch, useSelector } from "react-redux";

// Custom hooks for typed dispatch and selector
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Re-export for convenience
export { useDispatch, useSelector };
