
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Register />} />

                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/escanear"
                            element={<Scanner />}
                        />
                    </Route>

                    <Route element={<ProtectedRoute admin />}>
                        <Route
                            path="/admin"
                            element={<Navigate to="/dashboard" replace />}
                        />
                    </Route>

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
