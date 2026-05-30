import { useState } from "react";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";  
import Footer from "../components/Footer/Footer";
import "./ContactPage.css";

import { FiMapPin, FiMail, FiPhone } from "react-icons/fi";

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [loading, setLoading] = useState(false); 

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.warning("Please fill all fields ⚠️");
      return;
    }

    setLoading(true); 

    emailjs.send(
      "service_rky4ge7",      
      "template_s6gesqo",   
      {
        name: form.name,
        email: form.email,
        message: form.message,
      },
      "JWV53P2qkjEMidbIX"       
    )
    .then(() => {
      toast.success(`Message sent successfully, ${form.name}...`);

      setForm({
        name: "",
        email: "",
        message: ""
      });
    })
    .catch((error) => {
      console.error(error);
      toast.error("Failed to send message ❌");
    })
    .finally(() => {
      setLoading(false); // ✅ stop loading
    });
  };

  return (
    <div className="contact-page">

      {/* HEADER */}
      <section className="contact-header">
        <h1>Get in Touch</h1>
        <p>We’re here to help you with your parking needs.</p>
      </section>

      {/* MAIN SECTION */}
      <section className="contact-container">

        {/* LEFT SIDE */}
        <div className="contact-info">
          <h2>Contact Information</h2>

          <div className="info-item">
            <FiMapPin />
            <p>MG Road, Mumbai, Maharashtra</p>
          </div>

          <div className="info-item">
            <FiMail />
            <p>support@smartpark.com</p>
          </div>

          <div className="info-item">
            <FiPhone />
            <p>+91 98765 43210</p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send Message</h2>

          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <textarea
            placeholder="Your Message"
            rows="4"
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>

        </form>

      </section>

      <Footer />

    </div>
  );
}

export default ContactPage;