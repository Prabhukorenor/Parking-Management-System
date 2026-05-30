import { useEffect, useState } from 'react'
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { RiTwitterXLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import homeBackground from '../assets/home-bg1.jpg'
import keyFeature1 from '../assets/key-feature1.jpg'
import keyFeature2 from '../assets/key-feature2.png'
import keyFeature3 from '../assets/key-feature-3.png'
import keyFeature4 from '../assets/key-feature4.png'
import FilterSidebar from '../components/FilterSidebar/FilterSidebar.jsx'
import ParkingCard from '../components/ParkingCard/ParkingCard.jsx'
import { getParkingList } from '../services/parkingService'
import { getApiErrorMessage } from '../utils/formatters'
import Footer from "../components/Footer/Footer";
import './HomePage.css'

const defaultFilters = {
  city: '',
  vehicleType: '',
  amenities: [],
}

const featureCards = [
  {
    title: 'Real-Time Slot Availability',
    description: 'Check available, occupied, and full parking locations instantly.',
    image: keyFeature1,
  },
  {
    title: 'Location-Based Parking',
    description: 'Select parking slots from multiple locations easily.',
    image: keyFeature2,
  },
  {
    title: 'Easy Vehicle Entry & Exit',
    description: 'Quick vehicle check-in and check-out with a smooth user flow.',
    image: keyFeature3,
  },
  {
    title: 'Admin Control Panel',
    description: 'Monitor bookings, parking owners, and platform activity in one place.',
    image: keyFeature4,
  },
]

const testimonials = [
  {
    quote:
      ' "We implemented this system across our commercial property, and the efficiency improvement is remarkable. Everything feels organized and controlled."',
    author: 'John Anderson',
    role: 'Partner, Aum Architects',
    image: "/images/testimonial1.jpg",

  },
  {
    quote:
      '"Finding parking used to be stressful, but now it’s quick and reliable. The interface is clean and very easy to use.".',
    author: 'Rahul Sharma',
    role: 'Skyline Infra Pvt Ltd',
    image: "/images/testimonial2.jpg",

  },
  {
    quote:
      '"The parking system is easy to use and very efficient. Great support team and excellent service quality".',
    author: 'Legend Siroya Group',
    role: 'Business Group',
    image: "/images/testimonial3.jpg",

  },
  {
    quote:
      '"We highly recommend their parking solutions. The system improved our space utilization significantly".',
    author: 'Michael Thompson',
    role: 'UrbanSpace Developers',
    image: "/images/testimonial4.jpg",

  },
]

const footerLinks = [
  { label: 'Home', href: '/home' },
  { label: 'Register', href: '/register' },
  { label: 'Login', href: '/login' },
  { label: 'About', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

function HomePage() {
  const [filters, setFilters] = useState(defaultFilters)
  const [parkings, setParkings] = useState([])
  const [error, setError] = useState('')
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const loadParkings = async () => {
      try {
        setError('')
        const data = await getParkingList({
          city: filters.city || undefined,
          vehicleType: filters.vehicleType || undefined,
          amenities: filters.amenities.length ? filters.amenities : undefined,
        })
        setParkings(data)
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load parking spaces.'))
      }
    }

    loadParkings()
  }, [filters])

const [isPaused, setIsPaused] = useState(false);

const handleNextTestimonial = () => {
  setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
};

const handlePreviousTestimonial = () => {
  setActiveTestimonial((prev) =>
    prev === 0 ? testimonials.length - 1 : prev - 1
  );
};

// AUTO SLIDE
useEffect(() => {
  if (isPaused) return;

  const interval = setInterval(() => {
    handleNextTestimonial();
  }, 3000);

  return () => clearInterval(interval);
}, [activeTestimonial, isPaused]);

const currentTestimonial = testimonials[activeTestimonial];

  return (
    <div className="home-page">
      <section className="home-hero">
        <img className="home-hero__background" src={homeBackground} alt="" />
        <div className="home-hero__overlay" />
        <div className="home-hero__content page-shell">
          <div className="home-hero__copy">
            <h1>Smart Parking Management System</h1>
            <p>
              A modern solution to manage parking slots efficiently with real-time
              availability, easy entry, and exit management.
            </p>
            <div className="home-hero__actions">
              <Link className="btn home-page__button home-page__button--light" to="/about">
                Know More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-section--features">
        <div className="page-shell">
          <h2 className="home-section__title">Key Features</h2>
          <div className="home-features">
            {featureCards.map((feature) => (
              <article key={feature.title} className="home-feature-card">
                <div className="home-feature-card__media">
                  <img src={feature.image} alt={feature.title} />
                </div>
                <div className="home-feature-card__body">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    <section className="home-section home-section--testimonials">
      <div className="page-shell">
        <h2 className="home-section__title home-section__title--light">
          TESTIMONIALS
        </h2>

        <div className="testimonial-shell">
          <button
            className="testimonial-shell__arrow"
            onClick={handlePreviousTestimonial}
          >
            &lt;
          </button>

          <article
            key={activeTestimonial}
            className="testimonial-card"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <span className="testimonial-card__quote testimonial-card__quote--open">
              “
            </span>

            <div className="testimonial-card__content">
              {/* IMAGE */}
              <div className="testimonial-card__image">
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.author}
                />
              </div>

              {/* TEXT */}
              <div className="testimonial-card__text">
                <p>{currentTestimonial.quote}</p>

                <div className="testimonial-card__author">
                  <strong>{currentTestimonial.author}</strong>
                  <span>{currentTestimonial.role}</span>
                </div>
              </div>
            </div>

            <span className="testimonial-card__quote testimonial-card__quote--close">
              ”
            </span>

            <div className="testimonial-card__dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={index === activeTestimonial ? "is-active" : ""}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </article>

          <button
            className="testimonial-shell__arrow"
            onClick={handleNextTestimonial}
          >
            &gt;
          </button>
        </div>
      </div>
    </section>


      <section className="home-section home-section--cta">
        <div className="page-shell">
          <div className="home-cta">
            <h2>Ready to Find Your Parking Spot?</h2>
            <p>
              Join SmartPark today and experience hassle-free parking with real-time
              availability and seamless booking.
            </p>
            <div className="home-cta__actions">
              <Link className="btn home-page__button home-page__button--accent" to="/register">
                Get Started
              </Link>
              <Link className="btn home-page__button home-page__button--white" to="/login">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  )
}

export default HomePage
