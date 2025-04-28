
// Login.jsx
import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  //onAuthStateChanged,
} from "firebase/auth";
import {auth} from "../firebase";

const Login = (onLoginSuccess) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess() ;
      console.log("Signed in:", userCredential.user);
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please check your credentials.");
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return setError("Please enter your email for password reset.");
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent.");
    } catch (err) {
      console.error(err);
      setError("Failed to send password reset email.");
    }
  };

  const toggleRegister = () => {
    setShowRegister((prev) => !prev);
    setError("");
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 shadow-lg rounded-2xl bg-green-50 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
        <p className="text-gray-700">You are already logged in as <strong>{user.email}</strong>.</p>
      </div>
    );
  }
 else
  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-lg rounded-2xl bg-white relative">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded-md"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>

      <div className="mt-4 text-sm text-center">
        <button onClick={handlePasswordReset} className="text-blue-500 hover:underline">
          Forgot Password?
        </button>
        <br />
        <button onClick={toggleRegister} className="text-green-600 hover:underline mt-2">
          {showRegister ? "Close Registration" : "Create New Account"}
        </button>
      </div>

      {showRegister && <RegisterForm onClose={toggleRegister} />}
    </div>
  );
};

const RegisterForm = ({ onClose }) => {
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setSuccess("");

    if (regPassword !== confirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      console.log("Registered:", userCredential.user);
      setSuccess("Account created successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setRegError("Failed to register. Email might already be in use.");
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-95 rounded-2xl p-6 shadow-inner">
      <h3 className="text-xl font-semibold mb-4">Register</h3>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>
        {regError && <p className="text-red-500 text-sm">{regError}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
