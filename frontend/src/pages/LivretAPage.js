import React, { useState, useEffect } from 'react';
import './LivretAPage.css';

function LivretAPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/livreta/');
        if (response.ok) {
          const result = await response.json();
          setData(result);
          // Calcul de la balance
          const calculatedBalance = result.reduce((total, transaction) => total + parseFloat(transaction.amount), 0);
          setBalance(calculatedBalance);
        } else {
          console.error('Erreur lors de la récupération des données du Livret A.');
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="loading-message">Chargement des données du Livret A...</div>;
  }

  return (
    <div className="livret-a-page">
      <h2>Données du Livret A</h2>
      <div className="balance-summary">
        Solde actuel : <span className={balance >= 0 ? 'balance-positive' : 'balance-negative'}>{balance.toFixed(2)} €</span>
      </div>
      {data.length === 0 ? (
        <p>Aucune donnée à afficher pour le Livret A. Veuillez ajouter des transactions depuis le panneau d'administration de Django.</p>
      ) : (
        <table className="livret-a-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.label}</td>
                <td className={item.amount >= 0 ? 'amount-positive' : 'amount-negative'}>{parseFloat(item.amount).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LivretAPage;