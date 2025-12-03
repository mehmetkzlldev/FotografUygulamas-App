import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import './OnboardingScreen.css';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingData = [
  {
    id: '1',
    title: 'Hızlı Düzenle',
    description: '3-4 dokunuşla profesyonel sonuçlar al',
    emoji: '⚡',
  },
  {
    id: '2',
    title: 'AI Özellikler',
    description: 'Akıllı arka plan kaldırma ve otomatik düzenleme',
    emoji: '✨',
  },
  {
    id: '3',
    title: 'Kolay Paylaş',
    description: 'Story, Post ve Reels için hazır boyutlarda export',
    emoji: '📱',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    onComplete();
    navigate('/');
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-slide">
        <span className="onboarding-emoji">{onboardingData[currentIndex].emoji}</span>
        <h1 className="onboarding-title">{onboardingData[currentIndex].title}</h1>
        <p className="onboarding-description">
          {onboardingData[currentIndex].description}
        </p>
      </div>

      {/* Pagination */}
      <div className="onboarding-pagination">
        {onboardingData.map((_, index) => (
          <div
            key={index}
            className={`onboarding-dot ${
              index === currentIndex ? 'onboarding-dot-active' : ''
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="onboarding-footer">
        <Button
          title={currentIndex === onboardingData.length - 1 ? 'Başla' : 'İleri'}
          onPress={handleNext}
          className="onboarding-button"
        />
      </div>
    </div>
  );
};

export default OnboardingScreen;
