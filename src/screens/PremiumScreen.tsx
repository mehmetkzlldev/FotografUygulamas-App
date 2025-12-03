import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import './PremiumScreen.css';

const PremiumScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, setPremium } = useAppStore();

  const features = [
    {
      title: 'AI Arka Plan Kaldırma',
      description: 'Sınırsız kredi ile profesyonel arka plan kaldırma',
      icon: '✨',
    },
    {
      title: 'Pro Düzenleme',
      description: 'Otomatik renk düzeltme ve netleştirme',
      icon: '🎯',
    },
    {
      title: 'Hazır Şablonlar',
      description: 'Story ve Post template\'leri',
      icon: '📱',
    },
    {
      title: 'Premium Filtreler',
      description: 'Özel preset paketleri',
      icon: '🎨',
    },
    {
      title: 'Filigronsuz Export',
      description: 'Filigran olmadan kaydet ve paylaş',
      icon: '💎',
    },
    {
      title: 'HD Export',
      description: 'Yüksek çözünürlüklü kaydetme',
      icon: '🔍',
    },
    {
      title: 'Toplu Düzenleme',
      description: 'Birden fazla fotoğrafı aynı anda düzenle',
      icon: '⚡',
    },
  ];

  const plans = [
    {
      id: 'monthly',
      title: 'Aylık',
      price: '₺49.99',
      period: '/ay',
      popular: false,
    },
    {
      id: 'yearly',
      title: 'Yıllık',
      price: '₺399.99',
      period: '/yıl',
      popular: true,
      savings: '33% tasarruf',
    },
  ];

  const handleSubscribe = (planId: string) => {
    alert(`${planId === 'monthly' ? 'Aylık' : 'Yıllık'} abonelik başlatılıyor...`);
    setPremium(true);
    navigate('/');
  };

  // Parallax efektini başlat
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.premium-screen .parallax-layer');
      parallaxElements.forEach((el, index) => {
        const speed = (index + 1) * 0.1;
        (el as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="premium-screen">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="parallax-layer layer-1"></div>
        <div className="parallax-layer layer-2"></div>
        <div className="parallax-layer layer-3"></div>
        <div className="gradient-overlay"></div>
      </div>

      <div className="premium-wrapper">
        {/* Header */}
        <header className="premium-header">
          <button onClick={() => navigate('/')} className="header-button">
            ← Geri
          </button>
          <h1 className="premium-header-title">Premium</h1>
          <div style={{ width: '60px' }} />
        </header>

        {/* Hero Section */}
        <section className="premium-hero">
          <div className="crown-container">
            <span className="crown">👑</span>
          </div>
          <h2 className="hero-title">Premium'a Geç</h2>
          <p className="hero-subtitle">
            Profesyonel özelliklerle fotoğraflarınızı bir üst seviyeye taşıyın
          </p>
        </section>

        {/* Features */}
        <section className="premium-features">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">{feature.icon}</span>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Pricing Plans */}
        <section className="premium-pricing">
          <h2 className="section-title">Abonelik Planları</h2>
          <div className="plans-container">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSubscribe(plan.id)}
                className={`plan-card ${plan.popular ? 'plan-card-popular' : ''}`}
              >
                {plan.popular && (
                  <div className="popular-badge">EN POPÜLER</div>
                )}
                <div className="plan-header">
                  <h3 className="plan-title">{plan.title}</h3>
                  {plan.savings && (
                    <span className="savings-text">{plan.savings}</span>
                  )}
                </div>
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="premium-cta">
          <p className="cta-text">
            Tüm premium özelliklere erişim sağla ve sınırsız düzenleme yap!
          </p>
        </section>
      </div>
    </div>
  );
};

export default PremiumScreen;
