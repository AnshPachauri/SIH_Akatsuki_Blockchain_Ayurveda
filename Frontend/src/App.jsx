import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/auth/Signup";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          {/* <Route path="/signin" element={<Signin />} /> */}

          {/* Dashboards */}
          {/* <Route path="/user/dashboard" element={<UserDashboard />} /> */}
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
