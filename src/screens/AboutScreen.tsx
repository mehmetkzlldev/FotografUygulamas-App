import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getStatistics } from '../utils/mongodb';
import './AboutScreen.css';

const AboutScreen: React.FC = () => {
  const [stats, setStats] = useState({
    photosEdited: 1250,
    activeUsers: 150,
    countries: 50 // Ülke sayısı sabit kalabilir veya farklı bir kaynaktan gelebilir
  });

  useEffect(() => {
    // İstatistikleri yükle
    const loadStats = async () => {
      try {
        const statistics = await getStatistics();
        if (statistics) {
          setStats({
            photosEdited: Math.max(statistics.photosEdited || 1250, 1250),
            activeUsers: Math.max(statistics.activeUsers || 150, 150),
            countries: 50 // Ülke sayısı
          });
        }
      } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
      }
    };
    loadStats();
  }, []);

  const team = [
    { name: 'Mehmet', role: 'Kurucu', avatar: '👨‍💼' },
  ];

  const values = [
    {
      icon: 'fas fa-lightbulb',
      title: 'Yenilikçilik',
      description: 'Teknolojinin öncüsü olmak için sürekli gelişiyoruz'
    },
    {
      icon: 'fas fa-heart',
      title: 'Kullanıcı Odaklılık',
      description: 'Kullanıcı deneyimini en üst seviyeye çıkarmak önceliğimiz'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Güvenilirlik',
      description: 'Verilerinizin güvenliği bizim için çok önemli'
    },
    {
      icon: 'fas fa-rocket',
      title: 'Hızlılık',
      description: 'En hızlı ve en verimli çözümleri sunuyoruz'
    }
  ];

  return (
    <div className="about-screen">
      <Header />
      <main className="about-main">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1 className="about-hero-title">Hakkımızda</h1>
            <p className="about-hero-subtitle">
              Fotoğraf düzenleme deneyimini demokratikleştiriyoruz
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="about-story">
          <div className="story-content">
            <div className="story-text">
              <h2 className="story-title">Hikayemiz</h2>
              <p className="story-paragraph">
                FotografApp, 2023 yılında profesyonel fotoğraf düzenleme araçlarını herkese ulaştırma vizyonu ile kuruldu. 
                Amacımız, karmaşık yazılımlar olmadan herkesin fotoğraflarını profesyonel seviyede düzenleyebilmesini sağlamak.
              </p>
              <p className="story-paragraph">
                AI teknolojilerini kullanarak, kullanıcı dostu bir arayüzle güçlü düzenleme araçlarını bir araya getirdik. 
                Bugün binlerce kullanıcı FotografApp ile fotoğraflarını dönüştürüyor.
              </p>
            </div>
            <div className="story-stats">
              <div className="stat-item">
                <div className="stat-value">
                  {stats.activeUsers >= 1000 
                    ? `${(stats.activeUsers / 1000).toFixed(1)}K+` 
                    : stats.activeUsers > 0 
                      ? `${stats.activeUsers}+` 
                      : '100+'}
                </div>
                <div className="stat-label">Mutlu Kullanıcı</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {stats.photosEdited >= 1000000 
                    ? `${(stats.photosEdited / 1000000).toFixed(1)}M+` 
                    : stats.photosEdited >= 1000 
                      ? `${(stats.photosEdited / 1000).toFixed(0)}K+` 
                      : stats.photosEdited > 0 
                        ? `${stats.photosEdited}+` 
                        : '1K+'}
                </div>
                <div className="stat-label">Düzenlenen Fotoğraf</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.countries}+</div>
                <div className="stat-label">Ülke</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values">
          <h2 className="section-title">Değerlerimiz</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <i className={`value-icon ${value.icon}`}></i>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team">
          <h2 className="section-title">Ekibimiz</h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-member">
                <div className="member-avatar">{member.avatar}</div>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-mission">
          <div className="mission-content">
            <h2 className="mission-title">Misyonumuz</h2>
            <p className="mission-text">
              Herkesin yaratıcı potansiyelini ortaya çıkarmasına yardımcı olmak. 
              Teknik bilgi gerektirmeden, sadece hayal gücünüzle profesyonel sonuçlar üretmenizi sağlamak.
            </p>
            <h2 className="mission-title">Vizyonumuz</h2>
            <p className="mission-text">
              Dünyanın en erişilebilir ve güçlü fotoğraf düzenleme platformu olmak. 
              AI teknolojilerini kullanarak, gelecekte herkesin birer görsel hikaye anlatıcısı olmasını sağlamak.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutScreen;
