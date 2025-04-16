import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import RegisterForAdmin from "./pages/RegisterForAdmin.jsx";
import Homepage from "./pages/Homepage.jsx";
import Courses from "./pages/Courses.jsx";
import Profile from "./pages/Profile.jsx";
import Layout from "./layout/Layout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLayout from "./layout/AdminLayout.jsx";
import CompleteRegistration from "./pages/CompleteRegistration.jsx";
//checking if the user is logged in
// if not, redirect to login page
const ProtectedRoute = ({ children }) => {
  const user =
    localStorage.getItem("studentId") || localStorage.getItem("professorId") || localStorage.getItem("adminId");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("role");

  if (!role || role !== "3") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* routes accessible without login(public) */}
        <Route path="/login" element={<Login />} />
        <Route path="/complete-registration" element={<CompleteRegistration />} />

        {/* routes accessible only when user logged in(protected) */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Homepage />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* routes accessible only when admin logged in */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="register" element={<RegisterForAdmin />}/>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
