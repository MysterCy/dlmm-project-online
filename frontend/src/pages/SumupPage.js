import React, { useState, useEffect } from 'react';
import './SumupPage.css';

function SumupPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/transactions/SumUP/');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error('Erreur lors de la récupération des transactions SumUP.');
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
      const response = await fetch('http://127.0.0.1:8000/api/upload/sumup/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setFile(null);
        // Recharge les transactions après un import réussi
        fetchTransactions(); 
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
    <div className="sumup-page">
      <h2>Transactions SumUP</h2>
      
      <div className="import-section">
        <input type="file" onChange={handleFileChange} accept=".csv" />
        <button onClick={handleFileUpload} disabled={!file}>Importer Fichier</button>
      </div>
      
      {transactions.length === 0 ? (
        <p>Aucune transaction à afficher. Importez un fichier SumUP pour commencer.</p>
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

export default SumupPage;