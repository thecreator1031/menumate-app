import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem("menumate_student_id");
    const savedPin = localStorage.getItem("menumate_admin_pin");
    if (savedId) {
      api
        .login(savedId, savedPin || undefined)
        .then((student) => {
          setUser(student);
          // If dietary_pref or student_type not set (default values from fresh signup)
          // we don't force re-setup here; the Vote page handles it
        })
        .catch(() => {
          localStorage.removeItem("menumate_student_id");
          localStorage.removeItem("menumate_admin_pin");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (studentId, pin) => {
    const student = await api.login(studentId, pin);
    localStorage.setItem("menumate_student_id", student.id);
    if (pin) localStorage.setItem("menumate_admin_pin", pin);
    setUser(student);
    return student;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem("menumate_student_id");
    localStorage.removeItem("menumate_admin_pin");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
