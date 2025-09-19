import React, { useState, useEffect } from 'react';
import './CreditAgricolePage.css';

function CreditAgricolePage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);

  const API_URL = 'https://dlmm-backend.onrender.com/api';

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/transactions/Crédit Agricole/`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error('Erreur lors de la récupération des transactions Crédit Agricole.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload/creditagricole/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchTransactions(); // Re-fetch pour afficher les nouvelles données
      } else {
        const errorData = await response.json();
        alert(`Erreur d'importation: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert("Erreur de connexion au serveur.");
    }
  };

  if (isLoading) {
    return <div className="loading-message">Chargement des transactions...</div>;
  }

  return (
    <div className="credit-agricole-page">
      <h2>Transactions Crédit Agricole</h2>

      <div className="import-section">
        <input type="file" onChange={handleFileChange} accept=".csv" />
        <button onClick={handleFileUpload} disabled={!file}>Importer Fichier</button>
      </div>
      
      {transactions.length === 0 ? (
        <p>Aucune transaction à afficher. Importez un fichier Crédit Agricole.</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.description}</td>
                <td className={transaction.amount < 0 ? 'amount-negative' : 'amount-positive'}>
                  {transaction.amount} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CreditAgricolePage;