import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import EditorScreen from './screens/EditorScreen';
import FeaturesScreen from './screens/FeaturesScreen';
import AboutScreen from './screens/AboutScreen';
import ContactScreen from './screens/ContactScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    // İlk açılış kontrolü - localStorage'dan oku
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    setIsFirstLaunch(!hasSeenOnboarding);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsFirstLaunch(false);
  };

  return (
    <div className="app-container">
      <main className="app-main-content">
        <Router>
          <Routes>
            {isFirstLaunch ? (
              <Route 
                path="/onboarding" 
                element={<OnboardingScreen onComplete={handleOnboardingComplete} />} 
              />
            ) : null}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/editor" element={<EditorScreen />} />
            <Route path="/ozellikler" element={<FeaturesScreen />} />
            <Route path="/hakkimizda" element={<AboutScreen />} />
            <Route path="/iletisim" element={<ContactScreen />} />
            {isFirstLaunch && (
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            )}
          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default App;

