import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Donate from "./pages/donor/Donate";
import MyDonations from "./pages/donor/MyDonations";
import NearbyDonations from "./pages/receiver/NearbyDonations";
import Tasks from "./pages/agent/Tasks";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import PostNeeds from "./pages/receiver/PostNeeds";
import MyRequests from "./pages/receiver/MyRequests";
import DonorRequests from "./pages/donor/DonorRequests";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Impact from "./pages/Impact";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import "./App.css";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
  <Route path="/impact" element={<Impact />} />
  <Route path="/login/:role" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
<Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <Notifications />
    </ProtectedRoute>
  }
/>
  <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
          {/* Donor */}
          <Route
            path="/donor/donate"
            element={
              <ProtectedRoute allowedRoles={["donor"]}>
                <Donate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donor/my-donations"
            element={
              <ProtectedRoute allowedRoles={["donor"]}>
                <MyDonations />
              </ProtectedRoute>


            }
          />
           <Route
  path="/donor/requests"
  element={
    <ProtectedRoute allowedRoles={["donor"]}>
      <DonorRequests />
    </ProtectedRoute>
  }
/>
          {/* Receiver */}
          <Route
            path="/receiver/nearby"
            element={
              <ProtectedRoute allowedRoles={["receiver"]}>
                <NearbyDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receiver/request"
            element={
              <ProtectedRoute allowedRoles={["receiver"]}>
                <PostNeeds />
              </ProtectedRoute>
            }
          />
          <Route
  path="/receiver/requests"
  element={
    <ProtectedRoute allowedRoles={["receiver"]}>
      <MyRequests />
    </ProtectedRoute>
  }
/>
          {/* Agent */}
          <Route
            path="/agent/tasks"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
