import { Link } from "react-router-dom";
import "./Footer.css";

// ICONS
import { FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";

// QUICK LINKS
const footerLinks = [
  { label: "Home", href: "/" },
  // { label: "Login", href: "/login" },
  // { label: "Register", href: "/register" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function Footer() {
  return (
    <footer className="home-footer">
      <div className=" home-footer__grid">

        {/* ADDRESS */}
        <div className="home-footer__column home-footer__column--address">
          <h3>Address</h3>

          <div className="home-footer__stack">

            <div className="home-footer__item home-footer__item--top">
              <FiMapPin />
              <div>
                <p>SmartPark Solutions</p>
                <p>Tech Hub Building, Block B</p>
                <p>MG Road, Mumbai</p>
                <p>Maharashtra - 500081</p>
              </div>
            </div>

            <div className="home-footer__item">
              <FiMail />
              <a href="mailto:support@parkease.com">
                support@parkease.com
              </a>
            </div>

            <div className="home-footer__item">
              <FiPhone />
              <a href="tel:+919876543210">
                +91 98765 43210
              </a>
            </div>

          </div>
        </div>

        {/* LINKS */}
        <div className="home-footer__column home-footer__column--links">
          <h3>Quick Links</h3>

          <div className="home-footer__links">
            {footerLinks.map((link) => (
              <Link key={link.label} to={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* SOCIAL */}
        <div className="home-footer__column home-footer__column--social">
          <h3>Follow Us</h3>

          <div className="home-footer__socials">
            <a href="/" aria-label="Twitter / X">
              <RiTwitterXLine />
            </a>

            <a href="/" aria-label="Instagram">
              <FaInstagram />
            </a>

            <a href="/" aria-label="Facebook">
              <FaFacebookF />
            </a>

            <a href="/" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="home-footer__bottom">
        <p>© Copyright FY2025-2026 | All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;