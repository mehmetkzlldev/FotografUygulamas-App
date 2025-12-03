import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedImage } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file || !file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görüntü dosyası seçin.');
      e.target.value = '';
      setIsMobileMenuOpen(false);
      return;
    }

    // Dosya boyutu kontrolü (80MB = 80 * 1024 * 1024 bytes)
    const maxSize = 80 * 1024 * 1024; // 80MB
    if (file.size > maxSize) {
      alert('Dosya boyutu çok büyük! Maksimum 80 MB boyutunda dosya yükleyebilirsiniz.');
      e.target.value = '';
      setIsMobileMenuOpen(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUri = event.target?.result as string;
      setSelectedImage(imageUri);
      navigate('/editor');
    };
    reader.onerror = () => {
      alert('Dosya okunurken bir hata oluştu. Lütfen tekrar deneyin.');
    };
    reader.readAsDataURL(file);
    
    // Input'u temizle ki aynı dosya tekrar seçilebilsin
    e.target.value = '';
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Ana Sayfa' },
    { path: '/ozellikler', label: 'Özellikler' },
    { path: '/hakkimizda', label: 'Hakkımızda' },
    { path: '/iletisim', label: 'İletişim' },
  ];

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div 
          className="header-logo" 
          onClick={() => navigate('/')}
        >
          <span className="logo-icon">📸</span>
          <span className="logo-text">FotografApp</span>
        </div>

        {/* Desktop Menu */}
        <nav className="header-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="header-actions">
          <button 
            className="header-cta"
            onClick={handleFileSelect}
          >
            Düzenlemeye Başla
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => {
              navigate(item.path);
              setIsMobileMenuOpen(false);
            }}
          >
            {item.label}
          </button>
        ))}
        <button 
          className="mobile-cta"
          onClick={handleFileSelect}
        >
          Düzenlemeye Başla
        </button>
      </div>
    </header>
  );
};

export default Header;

