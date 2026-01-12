// src/components/room/SearchRooms.jsx

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";

import RoomCard from "./RoomCard";
import {
  searchRooms,
  clearSearchResults,
  selectSearchResults,
} from "@/features/room/roomSlice";
import { useDebounce } from "@/hooks/useDebounce";

const SearchRooms = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchResults = useSelector(selectSearchResults);
  const { searchLoading, searchQuery } = useSelector((state) => state.room);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      dispatch(searchRooms({ query: debouncedQuery }));
    } else {
      dispatch(clearSearchResults());
    }
  }, [dispatch, debouncedQuery]);

  // Clear on unmount
  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleJoin = (room) => {
    navigate(`/chat/${room._id}`);
    onClose?.();
  };

  const handleClear = () => {
    setQuery("");
    dispatch(clearSearchResults());
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input
          type="text"
          placeholder="Search rooms by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-dark-800 border border-dark-600 rounded-xl
                   text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 
                   focus:ring-primary-500 transition-all"
          autoFocus
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-dark-400 
                     hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="max-h-[60vh] overflow-y-auto space-y-3 no-scrollbar">
        {searchLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        )}

        {!searchLoading && query.length >= 2 && searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-dark-400">No rooms found for "{query}"</p>
          </div>
        )}

        {!searchLoading &&
          searchResults.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              showDistance={false}
              onJoin={() => handleJoin(room)}
            />
          ))}

        {query.length < 2 && query.length > 0 && (
          <p className="text-center text-dark-500 text-sm py-4">
            Type at least 2 characters to search
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchRooms;
