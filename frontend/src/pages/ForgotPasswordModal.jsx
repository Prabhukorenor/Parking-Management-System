import { useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import "./ForgotPasswordModal.css";

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🔹 Generate OTP
  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  // 🔹 Send OTP
  const sendOtp = () => {
    if (!email) {
      toast.warning("Enter your email first");
      return;
    }

    const otpValue = generateOtp();
    setGeneratedOtp(otpValue);

    emailjs
      .send(
        "service_rky4ge7",
        "template_sc91tpq",
        { to_email: email, otp: otpValue },
        "JWV53P2qkjEMidbIX"
      )
      .then(() => {
        toast.success("OTP sent to email 📧");
        setStep(2);
      })
      .catch(() => toast.error("Failed to send OTP ❌"));
  };

  // 🔹 Verify OTP
  const verifyOtp = () => {
    if (otp === generatedOtp) {
      toast.success("OTP verified ✅");
      setStep(3);
    } else {
      toast.error("Invalid OTP ❌");
    }
  };

  // 🔹 Reset Password (call backend)
  const resetPassword = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      toast.success("Password updated 🎉");
      onClose();
    } catch {
      toast.error("Reset failed ❌");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">

        <button className="close-btn" onClick={onClose}>close</button>

        {step === 1 && (
          <>
            <h2>Forgot Password?</h2>
            <span>*Please enter your registered email</span>
            <input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendOtp}>Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Verify OTP</h2>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp}>Verify</button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Reset Password</h2>
            <input
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={resetPassword}>Update Password</button>
          </>
        )}
      </div>
    </div>
  );
}