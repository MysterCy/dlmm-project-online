import React, { useState, useEffect } from 'react';
import './HomePage.css'; // Nous créerons ce fichier à l'étape 2

function HomePage() {
  const [balances, setBalances] = useState({
    sumup: null,
    creditAgricole: null,
    livretA: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Remplacez cette fonction par une vraie requête API si vous en avez une
  const fetchBalances = async () => {
    // Pour l'instant, on utilise les données statiques
    // tirées de vos fichiers CSV
    setBalances({
      sumup: '2314,71 €',
      creditAgricole: '783,89 €',
      livretA: '9 000,00 €',
    });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  if (isLoading) {
    return <div className="loading-message">Chargement des soldes...</div>;
  }

  return (
    <div className="home-page-container">
      <h2>Soldes des Comptes</h2>
      <div className="balances-grid">
        <div className="balance-card sumup-card">
          <h3>Solde SumUP</h3>
          <p className="balance-amount">{balances.sumup}</p>
        </div>
        <div className="balance-card ca-card">
          <h3>Solde Crédit Agricole</h3>
          <p className="balance-amount">{balances.creditAgricole}</p>
        </div>
        <div className="balance-card livret-a-card">
          <h3>Solde Livret A</h3>
          <p className="balance-amount">{balances.livretA}</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;