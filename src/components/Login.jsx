// Login.jsx
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
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
      </div>
    </div>
  );
};

export default Login;
