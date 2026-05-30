import { useState, useEffect } from "react";
import "./AboutPage.css";
import Footer from "../components/Footer/Footer";

function About() {
    const images = [
    "/images/parking.jpg.jpg",
    "/images/parkibooking1.jpg",
    "/images/secure.jpg",
    "/images/parking2.jpg.jpg",
    "/images/parking3.jpg.jpg",
  ];

  const [current, setCurrent] = useState(0);

  // AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  return (
    <>
    <div className="about-page">

      {/* ABOUT US SECTION */}
      <section className="about-section about-intro">
        
        <h1 className="about-title">About SmartPark</h1>

        <p className="about-text">
          "SmartPark is designed to transform the way parking spaces are managed 
          and experienced. What was once considered a simple utility has now evolved 
          into a smart, technology-driven system that enhances both efficiency and user convenience".
        </p>

        <p className="about-text">
          "Our approach focuses on optimizing parking operations while delivering a 
          seamless experience to users. By integrating smart parking technology, we ensure 
          better utilization, improved accessibility, and reliable service".
        </p>
      </section>

      {/* WHY CHOOSE US */}
<section className="about-section why-section">

  <h2 className="section-title">Why Choose Us</h2>

  <div className="why-grid">

    <div className="why-card">
     <img src="/images/team.jpg" className="why-image" />
      <h3>Expert Team</h3>
      <p>
        Our platform is backed by skilled professionals dedicated to delivering
        efficient and reliable parking solutions through modern technology.
      </p>
    </div>

    <div className="why-card">
      <img src="/images/years1.jpg" className="why-image" />
      <h3>Proven Experience</h3>
      <p>
        With strong domain knowledge and continuous innovation, we provide
        scalable parking solutions that adapt to modern urban needs.
      </p>
    </div>

    <div className="why-card">
      <img src="/images/quality.jpg" className="why-image" />
      <h3>Quality Assurance</h3>
      <p>
        We ensure high-quality standards in performance, reliability, and user
        experience, delivering consistent and dependable service.
      </p>
    </div>

    <div className="why-card">
<img src="/images/support.jpg" className="why-image" />
      <h3>24/7 Support</h3>
      <p>
        Our support system is designed to provide continuous assistance,
        ensuring smooth operation and a hassle-free experience.
      </p>
    </div>

  </div>
</section>

{/* VISION & MISSION */}
<section className="vision-mission">
  <div className="vm-grid">

    <img src="/images/mission.jpg" className="vm-image" />

    <div className="vm-content">
      <h2>OUR MISSION</h2>
      <p>
        To provide world-class parking services, smart parking solutions and 
        technology-driven products that deliver unmatched value and earn 
        customer trust and loyalty.
      </p>
    </div>

    <div className="vm-content">
      <h2>OUR VISION</h2>
      <p>
        To be the world’s most trusted parking platform — the first choice 
        for smart, reliable, and efficient parking solutions.
      </p>
    </div>

   <img src="/images/vision.jpg" className="vm-image" />

  </div>

</section>

     {/* CAROUSEL SECTION */}
      <section className="carousel-section">

        <h2 className="section-title">Our Parking Experience</h2>

        <div className="carousel">

          <div
            className="carousel-track"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {images.map((img, index) => (
              <img src={img} key={index} className="carousel-image" />
            ))}
          </div>

          {/* DOTS */}
          <div className="carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={index === current ? "dot active" : "dot"}
                onClick={() => setCurrent(index)}
              ></span>
            ))}
          </div>

        </div>

      </section>
    
    </div>
    <Footer/>
    </>
    
  );
}

export default About;