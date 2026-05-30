import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboard.css";

function CustomerLayout({ children }) {
  return (
    <div className="dashboard">

      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          {children}
        </div>
      </div>

    </div>
  );
}

export default CustomerLayout;