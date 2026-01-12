// src/pages/dashboard/SearchPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SearchRooms from "@/components/room/SearchRooms";

const SearchPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 
                   rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Search Rooms</h1>
      </div>

      {/* Search Component */}
      <SearchRooms />
    </div>
  );
};

export default SearchPage;
