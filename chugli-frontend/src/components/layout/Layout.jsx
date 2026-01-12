// src/components/layout/Layout.jsx

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import CreateRoomModal from "@/components/room/CreateRoomModal";
import JoinRoomModal from "@/components/room/JoinRoomModal";
import DeleteRoomModal from "@/components/room/DeleteRoomModal";

const Layout = () => {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="page-container">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals */}
      <CreateRoomModal />
      <JoinRoomModal />
      <DeleteRoomModal />
    </div>
  );
};

export default Layout;
