import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { Link } from "react-router-dom";

function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const closeDropdown = () => setOpen(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="topbar">

      {/* <h2>Customer Dashboard</h2> */}

      <div className="profile" ref={dropdownRef} onClick={() => setOpen(!open)}>
        {user?.name}

        {open && (
          <div className="dropdown">
            <Link to="/customer/profile" onClick={closeDropdown}>My Profile</Link>
            <Link to="/customer/bookings" onClick={closeDropdown}>My Bookings</Link>
            <button onClick={() => {
              closeDropdown();
              logout();
            }}>Logout</button>
          </div>
        )}
      </div>

    </div>
  );
}

export default Topbar;
