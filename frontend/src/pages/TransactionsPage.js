import React, { useState, useEffect } from 'react';
import './TransactionsPage.css';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [justificatifFile, setJustificatifFile] = useState(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [checkedState, setCheckedState] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [
        sumupResponse,
        creditAgricoleResponse,
        categoriesResponse
      ] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/transactions/SumUP/'),
        fetch('http://127.0.0.1:8000/api/transactions/Crédit Agricole/'),
        fetch('http://127.0.0.1:8000/api/categories/')
      ]);
      
      let transactionsData = [];

      if (sumupResponse.ok) {
        const sumupData = await sumupResponse.json();
        transactionsData = transactionsData.concat(sumupData);
      } else {
        console.error('Erreur lors de la récupération des transactions SumUP.');
      }
      
      if (creditAgricoleResponse.ok) {
        const creditAgricoleData = await creditAgricoleResponse.json();
        transactionsData = transactionsData.concat(creditAgricoleData);
      } else {
        console.error('Erreur lors de la récupération des transactions Crédit Agricole.');
      }

      // Tri des transactions par date, des plus récentes aux plus anciennes
      transactionsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTransactions(transactionsData);

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } else {
        console.error('Erreur lors de la récupération des catégories.');
      }

    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCategoryChange = async (transactionId, newCategoryId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/transactions/${transactionId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategoryId }),
      });

      if (response.ok) {
        console.log('Catégorie mise à jour avec succès.');
        // On cherche l'objet catégorie complet dans le state 'categories'
        const updatedCategory = categories.find(cat => String(cat.id) === newCategoryId);
        
        // Mise à jour du state avec l'objet catégorie complet
        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction.id === transactionId ? { ...transaction, category: updatedCategory } : transaction
          )
        );
      } else {
        console.error('Erreur lors de la mise à jour de la catégorie.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const handleFileChange = (event, transactionId) => {
    setJustificatifFile(event.target.files[0]);
    setSelectedTransactionId(transactionId);
  };
  
  const handleUploadJustificatif = async (transactionId) => {
    if (!justificatifFile) {
        alert("Veuillez sélectionner un fichier.");
        return;
    }

    const formData = new FormData();
    formData.append('justificatif', justificatifFile);

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/transactions/${transactionId}/upload_justificatif/`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const updatedTransaction = await response.json();
            setTransactions(prevTransactions =>
                prevTransactions.map(t =>
                    t.id === transactionId ? { ...t, justificatif: updatedTransaction.justificatif } : t
                )
            );
            alert("Justificatif importé avec succès.");
        } else {
            const errorData = await response.json();
            alert(`Erreur d'importation: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Erreur de connexion:", error);
        alert("Erreur de connexion au serveur.");
    }
  };

  const handleCheckboxChange = (transactionId) => {
    setCheckedState(prevState => ({
      ...prevState,
      [transactionId]: !prevState[transactionId],
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Le nom de la catégorie ne peut pas être vide.");
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/category/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      });
      
      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prevCategories => [...prevCategories, newCategory]);
        setNewCategoryName('');
        alert(`La catégorie "${newCategory.name}" a été créée avec succès.`);
      } else {
        console.error('Erreur lors de la création de la catégorie.');
        alert("Erreur lors de la création de la catégorie.");
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert("Erreur de connexion au serveur.");
    }
  };


  if (isLoading) {
    return <div className="loading-message">Chargement des transactions...</div>;
  }

  return (
    <div className="transactions-page">
      <h2>Toutes les Transactions</h2>

      <div className="category-creation-section">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nouvelle catégorie"
        />
        <button onClick={handleCreateCategory}>Créer une catégorie</button>
      </div>

      {transactions.length === 0 ? (
        <p>Aucune transaction à afficher.</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Compte</th>
              <th>Libellé</th>
              <th>Montant</th>
              <th>Catégorie</th>
              <th>Justificatif</th>
              <th>Pointé</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.account_name}</td>
                <td>{transaction.description}</td>
                <td className={transaction.amount < 0 ? 'amount-negative' : 'amount-positive'}>
                  {transaction.amount} €
                </td>
                <td className="transaction-category-cell">
                  {transaction.category_name ? transaction.category_name : 'Non classé'}
                </td>
                <td>
                  {transaction.justificatif ? (
                    <a href={`http://127.0.0.1:8000${transaction.justificatif}`} target="_blank" rel="noopener noreferrer">
                      <span role="img" aria-label="justificatif-uploaded">✅</span>
                    </a>
                  ) : (
                    transaction.amount < 0 && (
                      <>
                        <input type="file" onChange={(e) => handleFileChange(e, transaction.id)} />
                        <button onClick={() => handleUploadJustificatif(transaction.id)} disabled={!justificatifFile || selectedTransactionId !== transaction.id}>
                          Importer
                        </button>
                      </>
                    )
                  )}
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!checkedState[transaction.id]}
                    onChange={() => handleCheckboxChange(transaction.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionsPage;