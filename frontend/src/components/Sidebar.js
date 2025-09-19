import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar-container">
      <ul className="sidebar-menu">
        {/* C'est la ligne à modifier */}
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        <li><Link to="/sumup">SumUP</Link></li>
        <li><Link to="/credit-agricole">Crédit Agricole</Link></li>
        <li><Link to="/livret-a">Livret A</Link></li>
        <li><Link to="/statistiques">Statistiques</Link></li>
        <li><Link to="/budget">Budget</Link></li>
        <li><Link to="/parametres">Paramètres</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;