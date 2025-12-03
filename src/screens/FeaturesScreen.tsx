import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import './FeaturesScreen.css';

const FeaturesScreen: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      category: 'AI Özellikler',
      icon: 'fas fa-brain',
      color: '#6366f1',
      items: [
        {
          title: 'AI Arka Plan Kaldırma',
          description: 'Tek tıkla profesyonel arka plan kaldırma işlemi',
          icon: 'fas fa-cut'
        },
        {
          title: 'Otomatik Renk Düzeltme',
          description: 'AI destekli akıllı renk ve ton ayarlaması',
          icon: 'fas fa-palette'
        },
        {
          title: 'Akıllı Netleştirme',
          description: 'Bulanık fotoğrafları otomatik netleştirme',
          icon: 'fas fa-magic'
        }
      ]
    },
    {
      category: 'Düzenleme Araçları',
      icon: 'fas fa-sliders-h',
      color: '#8b5cf6',
      items: [
        {
          title: 'Parlaklık & Kontrast',
          description: 'Profesyonel ışık ayarları',
          icon: 'fas fa-sun'
        },
        {
          title: 'Doygunluk & Ton',
          description: 'Renk düzenleme kontrolleri',
          icon: 'fas fa-adjust'
        },
        {
          title: 'Keskinlik & Bulanıklık',
          description: 'Detay ve yumuşaklık ayarları',
          icon: 'fas fa-circle-notch'
        }
      ]
    },
    {
      category: 'Filtreler & Efektler',
      icon: 'fas fa-filter',
      color: '#3b82f6',
      items: [
        {
          title: '50+ Hazır Filtre',
          description: 'Profesyonel görünüm için hazır filtreler',
          icon: 'fas fa-image'
        },
        {
          title: 'Özel Filtre Oluştur',
          description: 'Kendi filtrelerinizi kaydedin ve paylaşın',
          icon: 'fas fa-plus-circle'
        },
        {
          title: 'Vintage & Modern',
          description: 'Nostaljik ve çağdaş efektler',
          icon: 'fas fa-star'
        }
      ]
    },
    {
      category: 'Metin & Sticker',
      icon: 'fas fa-font',
      color: '#ec4899',
      items: [
        {
          title: 'Metin Ekleme',
          description: 'Özelleştirilebilir fontlar ve stiller',
          icon: 'fas fa-text-height'
        },
        {
          title: 'Sticker Kütüphanesi',
          description: 'Binlerce emoji ve sticker',
          icon: 'fas fa-smile'
        },
        {
          title: 'Çizim Araçları',
          description: 'Serbest çizim ve şekiller',
          icon: 'fas fa-pencil-alt'
        }
      ]
    },
    {
      category: 'Export & Paylaşım',
      icon: 'fas fa-share-alt',
      color: '#f59e0b',
      items: [
        {
          title: 'HD Export',
          description: 'Yüksek çözünürlüklü kaydetme',
          icon: 'fas fa-download'
        },
        {
          title: 'Sosyal Medya Boyutları',
          description: 'Instagram, Facebook, Twitter için optimize',
          icon: 'fas fa-share-square'
        },
        {
          title: 'Toplu İşleme',
          description: 'Birden fazla fotoğrafı aynı anda düzenle',
          icon: 'fas fa-images'
        }
      ]
    },
    {
      category: 'Şablonlar',
      icon: 'fas fa-layer-group',
      color: '#10b981',
      items: [
        {
          title: 'Story Şablonları',
          description: 'Instagram Story için hazır tasarımlar',
          icon: 'fas fa-mobile-alt'
        },
        {
          title: 'Post Şablonları',
          description: 'Sosyal medya gönderileri için şablonlar',
          icon: 'fas fa-square'
        },
        {
          title: 'Kolaj Şablonları',
          description: 'Birden fazla fotoğrafı birleştir',
          icon: 'fas fa-th'
        }
      ]
    }
  ];

  return (
    <div className="features-screen">
      <Header />
      <main className="features-main">
        {/* Hero Section */}
        <section className="features-hero">
          <div className="features-hero-content">
            <h1 className="features-hero-title">Güçlü Özellikler</h1>
            <p className="features-hero-subtitle">
              Fotoğraflarınızı profesyonel seviyeye taşıyacak tüm araçlar
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features-list">
          {features.map((category, index) => (
            <div key={index} className="feature-category">
              <div className="category-header">
                <div 
                  className="category-icon-wrapper"
                  style={{ background: `${category.color}20`, borderColor: category.color }}
                >
                  <i className={`category-icon ${category.icon}`} style={{ color: category.color }}></i>
                </div>
                <h2 className="category-title">{category.category}</h2>
              </div>
              <div className="category-items">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="feature-item-card">
                    <i className={`feature-item-icon ${item.icon}`} style={{ color: category.color }}></i>
                    <div className="feature-item-content">
                      <h3 className="feature-item-title">{item.title}</h3>
                      <p className="feature-item-description">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="features-cta">
          <div className="cta-content">
            <h2 className="cta-title">Hemen Başlayın</h2>
            <p className="cta-description">
              Tüm özelliklere ücretsiz erişim sağlayın ve fotoğraflarınızı dönüştürün
            </p>
            <button 
              className="cta-button"
              onClick={() => navigate('/editor')}
            >
              Düzenlemeye Başla
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesScreen;

