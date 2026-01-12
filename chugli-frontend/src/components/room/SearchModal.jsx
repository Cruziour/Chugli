// src/components/room/SearchModal.jsx

import { useDispatch, useSelector } from "react-redux";
import Modal from "@/components/common/Modal";
import SearchRooms from "./SearchRooms";

const SearchModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Rooms" size="large">
      <SearchRooms onClose={onClose} />
    </Modal>
  );
};

export default SearchModal;
