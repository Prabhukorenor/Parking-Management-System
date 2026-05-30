import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const { pathname } = useLocation();

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">SmartPark</h2>

      <Link className={pathname.includes("home") ? "active" : ""} to="/customer/home">
        Dashboard
      </Link>

      <Link className={pathname.includes("bookings") ? "active" : ""} to="/customer/bookings">
        My Bookings
      </Link>

      <Link className={pathname.includes("reviews") ? "active" : ""} to="/customer/reviews">
        Reviews
      </Link>
    </div>
  );
}

export default Sidebar;
