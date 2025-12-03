import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Column */}
          <div className="footer-column">
            <div className="footer-logo">
              <span className="footer-logo-icon">📸</span>
              <span className="footer-logo-text">FotografApp</span>
            </div>
            <p className="footer-description">
              Profesyonel fotoğraf düzenleme araçları ile görsellerinizi bir üst seviyeye taşıyın.
            </p>
            <div className="footer-social">
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
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="footer-column">
            <h4 className="footer-title">Ürün</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => navigate('/ozellikler')}>Özellikler</button>
              </li>
              <li>
                <button onClick={() => navigate('/editor')}>Düzenleme</button>
              </li>
              <li>
                <a href="#fiyatlandirma">Fiyatlandırma</a>
              </li>
              <li>
                <a href="#sss">SSS</a>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="footer-column">
            <h4 className="footer-title">Şirket</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => navigate('/hakkimizda')}>Hakkımızda</button>
              </li>
              <li>
                <a href="#blog">Blog</a>
              </li>
              <li>
                <a href="#kariyer">Kariyer</a>
              </li>
              <li>
                <a href="#basin">Basın</a>
              </li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div className="footer-column">
            <h4 className="footer-title">Destek</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => navigate('/iletisim')}>İletişim</button>
              </li>
              <li>
                <a href="#yardim">Yardım Merkezi</a>
              </li>
              <li>
                <a href="#gizlilik">Gizlilik Politikası</a>
              </li>
              <li>
                <a href="#kullanim">Kullanım Koşulları</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} FotografApp. Tüm hakları saklıdır.
          </p>
          <div className="footer-legal">
            <a href="#gizlilik">Gizlilik</a>
            <span>•</span>
            <a href="#kullanim">Kullanım</a>
            <span>•</span>
            <a href="#cerezler">Çerezler</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

