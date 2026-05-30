import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AnalyticsPage from './pages/admin/AnalyticsPage.jsx'
import ParkingApprovalPage from './pages/admin/ParkingApprovalPage.jsx'
import ReviewsModerationPage from './pages/admin/ReviewsModerationPage.jsx'
import UsersManagementPage from './pages/admin/UsersManagementPage.jsx'
import AdminParkingDetailsPage from './pages/admin/AdminParkingDetailsPage.jsx'
import BookingPage from './pages/customer/BookingPage.jsx'
import CustomerHomePage from './pages/customer/CustomerHomePage.jsx'
import MyBookingsPage from './pages/customer/MyBookingsPage.jsx'
import ParkingDetailsPage from './pages/customer/ParkingDetailsPage.jsx'
import ReviewsPage from './pages/customer/ReviewsPage.jsx'
import UserProfilePage from './pages/customer/UserProfilePage.jsx'
import AddParkingPage from './pages/owner/AddParkingPage.jsx'
import EditParkingPage from './pages/owner/EditParkingPage.jsx'
import ManageParkingPage from './pages/owner/ManageParkingPage.jsx'
import ManageSlotsPage from './pages/owner/ManageSlotsPage.jsx'
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage.jsx'
import OwnerProfilePage from './pages/owner/OwnerProfilePage.jsx'
import OwnerParkingDetailsPage from './pages/owner/OwnerParkingDetailsPage.jsx'

// ✅ ADD THESE
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/customer"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <Navigate to="/customer/home" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/home"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <CustomerHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/parking/:parkingId"
          element={
            <ProtectedRoute roles={['CUSTOMER', 'ADMIN']}>
              <ParkingDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/book/:parkingId"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/reviews"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <ReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner"
          element={
            <ProtectedRoute roles={['OWNER']}>
              <Navigate to="/owner/add-parking" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/add-parking"
          element={
            <ProtectedRoute roles={['OWNER']}>
              <AddParkingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/manage-parking"
          element={
            <ProtectedRoute roles={['OWNER']}>
              <ManageParkingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/edit-parking/:parkingId"
          element={
            <ProtectedRoute roles={['OWNER']}>
              <EditParkingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/parking-details/:parkingId"
          element={
            <ProtectedRoute roles={['OWNER']}>
              <OwnerParkingDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/manage-slots"
          element={
            <ProtectedRoute roles={['OWNER']}>
              <ManageSlotsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/bookings"
          element={
            <ProtectedRoute roles={['OWNER']}>
              <OwnerBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/profile"
          element={
            <ProtectedRoute roles={['OWNER']}>
              <OwnerProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Navigate to="/admin/analytics" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parking-approval"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ParkingApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parking-details/:parkingId"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminParkingDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <ReviewsModerationPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

       {/* ✅ GLOBAL TOAST CONTAINER */}
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={true}
        pauseOnHover
        draggable
        theme="dark"
        toastClassName="premium-toast"
        closeButton={false}
      />
      
    </>
  )
}

export default App
