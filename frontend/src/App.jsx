import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import RegisterFormStudent from "./components/RegisterFormStudent.jsx";
import RegisterFormProfessor from "./components/RegisterFormProfessor.jsx";
import Homepage from "./pages/Homepage.jsx";
import Courses from "./pages/Courses.jsx";
import Profile from "./pages/Profile.jsx";
import Layout from "./layout/Layout.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>


        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="/courses" element={<Courses />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
