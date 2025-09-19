import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StatistiquesPage.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#00FF00', '#0000FF'];

function StatistiquesPage() {
  const [statsData, setStatsData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'https://dlmm-backend.onrender.com/api';

  const REVENUE_CATEGORIES = ['Ventes', 'DONS', 'Adhésions',"Remboursements","Intérêts Bancaires"];

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/categories/`);
      if (response.ok) {
        const data = await response.json();
        const sortedCategories = data.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(sortedCategories);
      } else {
        console.error('Erreur lors de la récupération des catégories.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  }, [API_URL]);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    let url = `${API_URL}/statistics/?`;

    if (selectedYear) {
      url += `year=${selectedYear}&`;
    }
    if (selectedMonth) {
      url += `month=${selectedMonth}&`;
    }
    
    const categoriesToFetch = Object.values(selectedFilters).filter(Boolean);
    categoriesToFetch.forEach(cat => {
      url += `categories=${cat}&`;
    });

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
      } else {
        console.error('Erreur lors de la récupération des statistiques.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, selectedYear, selectedMonth, selectedFilters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    const isCheckbox = event.target.type === 'checkbox';

    setSelectedFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      
      if (isCheckbox) {
        if (event.target.checked) {
          newFilters[value] = value;
        } else {
          delete newFilters[value];
        }
      }
      return newFilters;
    });
  };

  const years = ['2023', '2024', '2025'];
  const months = [
    { value: '1', label: 'Janvier' }, { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' }, { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' }, { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' }, { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' }, { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }
  ];

  if (isLoading || !statsData) {
    return <div className="loading-message">Chargement des statistiques...</div>;
  }
  
  const allAvailableCategories = statsData.categories_data || [];
  const revenuesCategories = allAvailableCategories.filter(cat => REVENUE_CATEGORIES.includes(cat.name));
  const expensesCategories = allAvailableCategories.filter(cat => !REVENUE_CATEGORIES.includes(cat.name));
  const totalExpenses = statsData ? statsData.expenses_total || 0 : 0;
  const totalRevenues = statsData ? statsData.revenues_total || 0 : 0;

  const pieChartRevenuesData = revenuesCategories.map(cat => ({
      name: cat.name,
      value: cat.total || 0
  }));

  const pieChartExpensesData = expensesCategories.map(cat => ({
      name: cat.name,
      value: Math.abs(cat.total) || 0
  }));

  return (
    <div className="stats-page-container">
      <h2>📊 Statistiques Financières</h2>

      <div className="card filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="year-select">Année :</label>
            <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">Toutes</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="month-select">Mois :</label>
            <select id="month-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="">Tous</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="category-checkboxes-container">
          <h4>Catégories :</h4>
          <div className="category-columns">
            <div className="category-column">
              <h4>Recettes</h4>
              {revenuesCategories.map(cat => (
                <div key={cat.name} className="category-item">
                  <div className="category-main-with-select">
                    <input
                      type="checkbox"
                      id={`cat-${cat.name}`}
                      name="category"
                      value={cat.name}
                      checked={!!selectedFilters[cat.name]}
                      onChange={handleCategoryChange}
                    />
                    <label htmlFor={`cat-${cat.name}`}>{cat.name}</label>
                  </div>
                </div>
              ))}
            </div>
            <div className="category-column">
              <h4>Dépenses</h4>
              {expensesCategories.map(cat => (
                <div key={cat.name} className="category-item">
                  <div className="category-main-with-select">
                    <input
                      type="checkbox"
                      id={`cat-${cat.name}`}
                      name="category"
                      value={cat.name}
                      checked={!!selectedFilters[cat.name]}
                      onChange={handleCategoryChange}
                    />
                    <label htmlFor={`cat-${cat.name}`}>{cat.name}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card summary-card">
        <div className="summary-section revenues">
          <h3>Total des Recettes</h3>
          <p>{totalRevenues.toFixed(2)} €</p>
        </div>
        <div className="summary-section expenses">
          <h3>Total des Dépenses</h3>
          <p>{totalExpenses.toFixed(2)} €</p>
        </div>
      </div>

      <div className="card charts-card">
        <div className="charts-grid">
          <div className="chart-container">
            <h3>Répartition des Recettes</h3>
            {pieChartRevenuesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartRevenuesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#2ecc71"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartRevenuesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data-message">Aucune donnée de recette.</p>
            )}
          </div>
          <div className="chart-container">
            <h3>Répartition des Dépenses</h3>
            {pieChartExpensesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartExpensesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#e74c3c"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartExpensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data-message">Aucune donnée de dépense.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="card table-card">
        <h3>Tableau Récapitulatif</h3>
        {categories.length > 0 ? (
          <div className="categories-breakdown-container">
            <div className="breakdown-section revenues-section">
              <h4>Recettes par Catégorie</h4>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {revenuesCategories.map((category) => (
                    <React.Fragment key={category.name}>
                      <tr className="category-row">
                        <td className="category-name-cell">{category.name}</td>
                        <td className="amount-positive total-row-cell">
                          {category.total !== null ? `${category.total.toFixed(2)} €` : '0.00 €'}
                        </td>
                      </tr>
                      {category.subcategories.map((subcategory) => (
                        <tr key={subcategory.name} className="subcategory-row">
                          <td style={{ paddingLeft: '20px' }}>{subcategory.name}</td>
                          <td className="amount-positive">
                            {subcategory.total !== null ? `${subcategory.total.toFixed(2)} €` : '0.00 €'}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}\n                </tbody>
              </table>
            </div>

            <div className="breakdown-section expenses-section">
              <h4>Dépenses par Catégorie</h4>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesCategories.map((category) => (
                    <React.Fragment key={category.name}>
                      <tr className="category-row">
                        <td className="category-name-cell">{category.name}</td>
                        <td className="amount-negative total-row-cell">
                          {category.total !== null ? `${category.total.toFixed(2)} €` : '0.00 €'}
                        </td>
                      </tr>
                      {category.subcategories.map((subcategory) => (
                        <tr key={subcategory.name} className="subcategory-row">
                          <td style={{ paddingLeft: '20px' }}>{subcategory.name}</td>
                          <td className="amount-negative">
                            {subcategory.total !== null ? `${subcategory.total.toFixed(2)} €` : '0.00 €'}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="no-data-message">Aucune donnée trouvée pour les filtres sélectionnés.</p>
        )}
      </div>
    </div>
  );
}

export default StatistiquesPage;