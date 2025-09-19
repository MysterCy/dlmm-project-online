import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Banner from './components/Banner';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import SumupPage from './pages/SumupPage';
import CreditAgricolePage from './pages/CreditAgricolePage';
import TransactionsPage from './pages/TransactionsPage'; 
import LivretAPage from './pages/LivretAPage';
import StatistiquesPage from './pages/StatistiquesPage';
import BudgetPage from './pages/BudgetPage';
import ParametresPage from './pages/ParametresPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Banner />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/sumup" element={<SumupPage />} />
              <Route path="/credit-agricole" element={<CreditAgricolePage />} />
              <Route path="/livret-a" element={<LivretAPage />} />
              <Route path="/statistiques" element={<StatistiquesPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/parametres" element={<ParametresPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;