import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useMountAnimation } from '../hooks/useAnimation';
import { getStatistics } from '../utils/mongodb';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../utils/animations.js';
import './HomeScreen.css';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { recentEdits, setSelectedImage } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir görüntü dosyası seçin.');
      return;
    }

    // Dosya boyutu kontrolü (80MB = 80 * 1024 * 1024 bytes)
    const maxSize = 80 * 1024 * 1024; // 80MB
    if (file.size > maxSize) {
      alert('Dosya boyutu çok büyük! Maksimum 80 MB boyutunda dosya yükleyebilirsiniz.');
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
  };

  const scrollToUpload = () => {
    if (dropZoneRef.current) {
      const headerHeight = 80; // Header yüksekliği
      const elementPosition = dropZoneRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Kısa bir gecikme ile input'u aç (kullanıcı scroll'u görsün)
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 600);
    }
  };

  const pickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = '';
  };

  // Drag & Drop handlers
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    };

    dropZone.addEventListener('dragenter', handleDragEnter);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragenter', handleDragEnter);
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const homeRef = useMountAnimation('fade', 100);
  const [stats, setStats] = useState({ photos: 0, filters: 53, users: 0 });

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    const loadStatistics = async () => {
      try {
        const dbStats = await getStatistics();
        
        if (!isMounted) return;
        
        if (dbStats) {
          const targets = {
            photos: dbStats.photosEdited || recentEdits.length,
            filters: dbStats.filtersCount || 53,
            users: dbStats.activeUsers || 0,
          };
          
          const duration = 2000;
          const steps = 60;
          const interval = duration / steps;
          
          let currentStep = 0;
          timer = setInterval(() => {
            if (!isMounted) {
              if (timer) clearInterval(timer);
              return;
            }
            
            currentStep++;
            const progress = Math.min(currentStep / steps, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            setStats({
              photos: Math.floor(targets.photos * easeOut),
              filters: Math.floor(targets.filters * easeOut),
              users: Math.floor(targets.users * easeOut),
            });
            
            if (currentStep >= steps) {
              if (timer) clearInterval(timer);
              setStats(targets);
            }
          }, interval);
        } else {
          const defaults = {
            photos: recentEdits.length,
            filters: 53,
            users: 0,
          };
          setStats(defaults);
        }
      } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
        if (isMounted) {
          setStats({
            photos: recentEdits.length,
            filters: 53,
            users: 0,
          });
        }
      }
    };

    loadStatistics();

    return () => {
      isMounted = false;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [recentEdits.length]);

  // Scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll(
      '.feature-demo-section, .stats-section, .features-grid-section, .testimonials-section'
    );
    
    sections.forEach((section) => {
      section.classList.add('fade-in-up');
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  const features = [
    {
      title: 'Üretken AI ile Yaratın',
      description: 'Hayal edin, yazın, görün. Görüntülerinize ayrıntılı öğeler eklemek, istenmeyen nesneleri kaldırmak ve arka planları genişletmek için Üretken Dolgu ve Üretken Genişletme özelliklerini kullanın.',
      icon: 'fas fa-brain',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      demo: 'AI',
    },
    {
      title: 'Renkleri Canlandırın',
      description: 'Birkaç tıklamayla renkleri kalın, canlı tonlara ayarlayın. Ton ve doygunluk kaydırıcılarını kullanarak görüntülerinizde dramatik renk ayarlamaları yapın.',
      icon: 'fas fa-palette',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      demo: 'COLOR',
    },
    {
      title: 'Rötuş ve Düzenleme',
      description: 'Tarayıcınızda görüntülerinizi çevrimiçi olarak ince ayarlayın ve dönüştürün. Nokta Düzeltme gibi araçlarla kusurları hızla kaldırın veya arka planı tamamen yeni bir şeyle değiştirin.',
      icon: 'fas fa-wand-magic-sparkles',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      demo: 'EDIT',
    },
    {
      title: 'Metin ve Tipografi',
      description: 'Görüntüleri ve metni bir araya getiren şık tasarımlar oluşturmak için 30.000\'den fazla font arasından seçim yapın. Mükemmel görünümü elde etmek için boyutu, aralığı, rengi ve daha fazlasını ayarlayın.',
      icon: 'fas fa-font',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      demo: 'TEXT',
    },
    {
      title: 'Arka Plan Kaldırma',
      description: 'AI destekli gelişmiş arka plan kaldırma aracı ile tek tıkla profesyonel sonuçlar elde edin. Nesneleri hassasiyetle izole edin.',
      icon: 'fas fa-cut',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      demo: 'BG',
      comingSoon: false,
    },
    {
      title: 'Görüntü Genişletme',
      description: 'Üretken AI ile görüntülerinizi sorunsuz bir şekilde genişletin. Arka planları akıllıca doldurun ve yeni boyutlar yaratın.',
      icon: 'fas fa-expand-arrows-alt',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      demo: 'EXPAND',
      comingSoon: true,
    },
  ];

  return (
    <div ref={homeRef as any} className="home-screen">
      <Header />
      
      {/* Animated Background */}
      <div className="animated-background">
        <div className="parallax-layer layer-1"></div>
        <div className="parallax-layer layer-2"></div>
        <div className="parallax-layer layer-3"></div>
        <div className="gradient-overlay"></div>
      </div>

      <div className="home-wrapper">
        {/* Hero Section - Drag & Drop */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Fotoğrafları ücretsiz ve çevrimiçi olarak düzenleyin
            </h1>
            <p className="hero-subtitle">
              FotografApp ile indirmeye gerek kalmadan muhteşem görseller, zengin grafikler ve inanılmaz sanat eserleri yaratın.
            </p>
            <p className="hero-description">
              <strong>Ücretsiz deneme sürümünü başlatın</strong> • Tüm özelliklere ücretsiz erişim
            </p>

            {/* Drag & Drop Zone */}
            <div 
              ref={dropZoneRef}
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onClick={pickImage}
            >
              <div className="drop-zone-content">
                <i className="drop-icon fas fa-cloud-upload-alt"></i>
                <p className="drop-text">
                  Bir görüntü yüklemek için dokunun
                </p>
                <p className="drop-subtext">
                  veya görüntünüzü buraya sürükleyip bırakın
                </p>
                <p className="drop-format">
                  Dosya JPEG, JPG veya PNG formatında ve en fazla 80 MB kadar olmalıdır
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </section>

        {/* Feature Demo Sections */}
        <section className="features-main-section">
          <div className="features-intro">
            <h2 className="features-main-title">
              FotografApp çevrimiçi uygulamasının gücünden yararlanın
            </h2>
            <p className="features-main-description">
              Web'de FotografApp'i indirmeye gerek kalmadan ücretsiz olarak kullanmaya başlayın. 
              Görüntülerinizdeki ayrıntıları ve renkleri hızla izole edin ve geliştirin, istenmeyen öğeleri 
              hassasiyetle kaldırın ve yeni nesil yapay zekayı kullanarak fikirlerinizi tam kreatif kontrolle hayata geçirin.
            </p>
          </div>

          {features.map((feature, index) => (
            <div key={index} className={`feature-demo-section ${index % 2 === 0 ? 'reverse' : ''}`}>
              <div className="feature-demo-content">
                <div className="feature-demo-text">
                  <h3 className="feature-demo-title">{feature.title}</h3>
                  <p className="feature-demo-description">{feature.description}</p>
                  {feature.comingSoon && (
                    <span className="coming-soon-badge">Yakında</span>
                  )}
                </div>
                <div 
                  className="feature-demo-visual"
                  style={{ background: feature.gradient }}
                >
                  <div className="demo-placeholder">
                    <i className={`demo-icon ${feature.icon}`}></i>
                    <span className="demo-text">{feature.demo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <i className="stat-icon fas fa-users"></i>
              <h4 className="stat-number">{stats.users.toLocaleString()}+</h4>
              <p className="stat-label">Aktif Kullanıcı</p>
            </div>
            <div className="stat-card">
              <i className="stat-icon fas fa-image"></i>
              <h4 className="stat-number">{stats.photos.toLocaleString()}+</h4>
              <p className="stat-label">Düzenlenen Fotoğraf</p>
            </div>
            <div className="stat-card">
              <i className="stat-icon fas fa-filter"></i>
              <h4 className="stat-number">{stats.filters}+</h4>
              <p className="stat-label">Profesyonel Filtre</p>
            </div>
            <div className="stat-card">
              <i className="stat-icon fas fa-star"></i>
              <h4 className="stat-number">4.9/5</h4>
              <p className="stat-label">Kullanıcı Puanı</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features-grid-section">
          <h2 className="section-title">Kolaylaştırılmış, çevrimiçi bir düzenleme deneyimi</h2>
          <p className="section-subtitle">
            Tüm beceri seviyelerindeki içerik oluşturucular için tasarlanan çok yönlü tek bir web uygulamasını 
            kullanarak görüntüleri hassas bir şekilde düzenleyin. Ayrıca, JPEG, PNG ve daha fazlası gibi birden çok dosya türünü yükleyip düzenleyin.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <i className="feature-card-icon fas fa-magic"></i>
              <h3 className="feature-card-title">AI Geliştirme</h3>
              <p className="feature-card-desc">
                Pozlama, renk ve detayları otomatik optimize edin
              </p>
            </div>
            <div className="feature-card">
              <i className="feature-card-icon fas fa-sliders-h"></i>
              <h3 className="feature-card-title">Gelişmiş Düzenleme</h3>
              <p className="feature-card-desc">
                Parlaklık, kontrast, doygunluk ve daha fazlası
              </p>
            </div>
            <div className="feature-card">
              <i className="feature-card-icon fas fa-cut"></i>
              <h3 className="feature-card-title">Arka Plan Kaldırma</h3>
              <p className="feature-card-desc">
                Tek tıkla profesyonel arka plan kaldırma
              </p>
            </div>
            <div className="feature-card">
              <i className="feature-card-icon fas fa-font"></i>
              <h3 className="feature-card-title">Metin Ekleme</h3>
              <p className="feature-card-desc">
                Özelleştirilebilir fontlar ve stiller
              </p>
            </div>
            <div className="feature-card">
              <i className="feature-card-icon fas fa-smile"></i>
              <h3 className="feature-card-title">Sticker & Emoji</h3>
              <p className="feature-card-desc">
                Binlerce sticker ve emoji seçeneği
              </p>
            </div>
            <div className="feature-card">
              <i className="feature-card-icon fas fa-download"></i>
              <h3 className="feature-card-title">HD Export</h3>
              <p className="feature-card-desc">
                Yüksek çözünürlüklü kaydetme
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-box">
            <h2 className="cta-title">Hemen başlayın, ücretsiz</h2>
            <p className="cta-text">
              Fotoğraflarınızı düzenlemeye başlamak için bir görüntü yükleyin
            </p>
            <button className="cta-button" onClick={scrollToUpload}>
              <i className="fas fa-upload"></i>
              Fotoğraf Yükle
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default HomeScreen;
