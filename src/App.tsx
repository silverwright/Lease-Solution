import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { Home } from './pages/Home';
import { ContractInitiation } from './pages/ContractInitiation';
import { LeaseCalculations } from './pages/LeaseCalculations';
import { Methodology } from './pages/Methodology';
import { Education } from './pages/Education';
import { Dashboard } from './pages/Dashboard';
import { Reports } from './pages/Reports';
import { LeaseProvider } from './context/LeaseContext';

function App() {
  return (
    <LeaseProvider>
      <Router>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/contract" element={<ContractInitiation />} />
              <Route path="/calculations" element={<LeaseCalculations />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="/education" element={<Education />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              {/* catch-all redirect */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LeaseProvider>
  );
}

export default App;
