// src/hooks/useOnClickOutside.js

import { useEffect } from "react";

/**
 * Hook to detect clicks outside of a ref element
 * @param {React.RefObject} ref - Reference to the element
 * @param {Function} handler - Handler to call on outside click
 */
export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export default useOnClickOutside;
