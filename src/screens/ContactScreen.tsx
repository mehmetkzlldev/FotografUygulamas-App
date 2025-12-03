import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ContactScreen.css';

const ContactScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: 'fas fa-envelope',
      title: 'E-posta',
      info: 'destek@fotografapp.com',
      link: 'mailto:destek@fotografapp.com'
    },
    {
      icon: 'fas fa-phone',
      title: 'Telefon',
      info: '+90 (533) 222 45 67',
      link: 'tel:+905332224567'
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Adres',
      info: 'İstanbul, Türkiye',
      link: '#'
    },
    {
      icon: 'fas fa-clock',
      title: 'Çalışma Saatleri',
      info: 'Pazartesi - Cuma: 09:00 - 18:00',
      link: '#'
    }
  ];

  return (
    <div className="contact-screen">
      <Header />
      <main className="contact-main">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="contact-hero-content">
            <h1 className="contact-hero-title">İletişim</h1>
            <p className="contact-hero-subtitle">
              Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="contact-content">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2 className="form-title">Bize Ulaşın</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Adınız Soyadınız</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Adınızı girin"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-posta Adresiniz</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="ornek@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Konu</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Mesajınızın konusu"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Mesajınız</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Mesajınızı buraya yazın..."
                  ></textarea>
                </div>

                <button type="submit" className="submit-button">
                  Mesaj Gönder
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info-section">
              <h2 className="info-title">İletişim Bilgileri</h2>
              <div className="info-cards">
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    className="info-card"
                    onClick={(e) => {
                      if (item.link === '#') e.preventDefault();
                    }}
                  >
                    <div className="info-icon-wrapper">
                      <i className={`info-icon ${item.icon}`}></i>
                    </div>
                    <div className="info-content">
                      <h3 className="info-card-title">{item.title}</h3>
                      <p className="info-card-text">{item.info}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Social Media */}
              <div className="social-section">
                <h3 className="social-title">Sosyal Medya</h3>
                <div className="social-links">
                  <a href="#" className="social-link" aria-label="Facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="social-link" aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="social-link" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="social-link" aria-label="LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" className="social-link" aria-label="YouTube">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactScreen;

