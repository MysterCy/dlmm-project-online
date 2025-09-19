import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './BudgetPage.css';

function BudgetPage() {
  const [categories, setCategories] = useState([]);
  const [yearlyData, setYearlyData] = useState({});
  const [budgetData, setBudgetData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Correction de l'avertissement 'react-hooks/exhaustive-deps' et des années à afficher
  const currentYear = new Date().getFullYear();
  const allYears = useMemo(() => {
    const pastYears = [currentYear - 1];
    const futureYears = [currentYear + 1, currentYear + 2];
    const years = [...pastYears, currentYear, ...futureYears].sort((a, b) => a - b);
    return years.filter(year => year !== 2023); // Enlève 2023 si elle est dans la liste
  }, [currentYear]);

  // Fonction pour charger les données budgétaires depuis le stockage local
  const loadBudgetData = () => {
    try {
      const storedData = localStorage.getItem('budgetData');
      if (storedData) {
        setBudgetData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Erreur lors du chargement du budget depuis le stockage local", error);
    }
  };

  // Fonction pour sauvegarder les données budgétaires
  const saveBudgetData = (data) => {
    try {
      localStorage.setItem('budgetData', JSON.stringify(data));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du budget dans le stockage local", error);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Récupérer toutes les catégories
      const categoriesResponse = await fetch('http://127.0.0.1:8000/api/categories/');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

      // 2. Récupérer les données de budget agrégées pour chaque année
      const yearlyDataPromises = allYears.map(year =>
        fetch(`http://127.0.0.1:8000/api/budget/summary/?year=${year}`)
          .then(res => res.json())
          .then(data => ({ year, data }))
      );

      const yearlyDataResults = await Promise.all(yearlyDataPromises);
      
      const aggregatedData = {};
      yearlyDataResults.forEach(({ year, data }) => {
        aggregatedData[year] = data;
      });
      setYearlyData(aggregatedData);

    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setIsLoading(false);
    }
  }, [allYears]);

  useEffect(() => {
    fetchData();
    loadBudgetData();
  }, [fetchData]);

  const handleBudgetChange = (subcategoryKey, year, value) => {
    const newBudgetData = { ...budgetData };
    const [categoryName, subcategoryName] = subcategoryKey.split('|');
    
    if (!newBudgetData[year]) {
      newBudgetData[year] = {};
    }
    if (!newBudgetData[year][categoryName]) {
      newBudgetData[year][categoryName] = {};
    }
    
    newBudgetData[year][categoryName][subcategoryName] = value;
    
    setBudgetData(newBudgetData);
    saveBudgetData(newBudgetData);
  };

  const renderTableBody = (isRevenue) => {
    const revenueCategories = categories.filter(cat => cat.name.toLowerCase() === 'revenus');
    const spendingCategories = categories.filter(cat => cat.name.toLowerCase() !== 'revenus');

    const categoriesToDisplay = isRevenue ? revenueCategories : spendingCategories;

    return (
      <tbody>
        {categoriesToDisplay.map((category) => (
          <React.Fragment key={category.id}>
            <tr className="category-header">
              <td colSpan={allYears.length + 1}>{category.name}</td>
            </tr>
            {category.subcategories.map((subcategory) => (
              <tr key={subcategory.id}>
                <td className="category-name">
                  {subcategory.name}
                </td>
                {allYears.map((year) => {
                  const subcategoryKey = `${category.name}|${subcategory.name}`;
                  const actual = yearlyData[year]?.[category.name]?.[subcategory.name]?.actual || 0;
                  const budget = budgetData[year]?.[category.name]?.[subcategory.name] || '';

                  if (year <= currentYear) {
                    return (
                      <td key={year} className="data-cell">
                        {actual.toFixed(2)} €
                      </td>
                    );
                  } else {
                    return (
                      <td key={year} className="input-cell">
                        <input
                          type="number"
                          value={budget}
                          placeholder="0.00"
                          onChange={(e) => handleBudgetChange(subcategoryKey, year, e.target.value)}
                        />
                      </td>
                    );
                  }
                })}
              </tr>
            ))}
            <tr className="category-total-row">
              <td className="category-total-cell">Total {category.name}</td>
              {allYears.map(year => {
                const categoryActualData = yearlyData[year]?.[category.name] || {};
                const categoryTotalActual = Object.values(categoryActualData).reduce((sum, subcat) => sum + (subcat.actual || 0), 0);
                
                const categoryBudgetData = budgetData[year]?.[category.name] || {};
                const categoryTotalBudget = Object.values(categoryBudgetData).reduce((sum, subcat) => sum + (parseFloat(subcat) || 0), 0);

                return (
                  <td key={year} className="data-cell">
                    {(year <= currentYear ? categoryTotalActual : categoryTotalBudget).toFixed(2)} €
                  </td>
                );
              })}
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    );
  };
  
  return (
    <div className="budget-page-container">
      <h2>Budget Annuel</h2>
      <p className="page-intro">
        Consultez les dépenses et recettes des années précédentes et planifiez les budgets pour les années à venir.
      </p>

      <div className="budget-table-container">
        <table className="budget-table">
          <thead>
            <tr>
              <th>Catégorie</th>
              {allYears.map(year => (
                <th key={year}>
                  <span className="budget-year">{year}</span>
                  {year === currentYear && <span className="current-year-badge">N</span>}
                  {year === currentYear + 1 && <span className="future-year-badge">N+1</span>}
                  {year === currentYear + 2 && <span className="future-year-badge">N+2</span>}
                  {year === currentYear - 1 && <span className="past-year-badge">N-1</span>}
                </th>
              ))}
            </tr>
          </thead>
          {renderTableBody(true)}
          {renderTableBody(false)}
        </table>
      </div>
    </div>
  );
}

export default BudgetPage;