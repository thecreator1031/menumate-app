import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Vote from "./pages/Vote";
import Leaderboard from "./pages/Leaderboard";
import AdminMenu from "./pages/AdminMenu";
import AdminWaste from "./pages/AdminWaste";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/vote" element={<ProtectedRoute role="student"><Vote /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute role="student"><Leaderboard /></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute role="admin"><AdminMenu /></ProtectedRoute>} />
      <Route path="/admin/waste" element={<ProtectedRoute role="admin"><AdminWaste /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}
