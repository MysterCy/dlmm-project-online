import React from 'react';
import './Banner.css';
import logo from '../logo.jpg'; 

function Banner() {
  return (
    <div className="banner-container">
      <img src={logo} alt="Logo de l'association DLMM" className="banner-logo" />
      <div className="banner-text">
        <h1 className="title-super-mario">Association Dans Le Monde de Mario</h1>
        <h2 className="subtitle-super-mario">L’Autisme au coeur de l’action</h2>
        <h3 className="title-comic-sans">Espace Comptabilité</h3>
      </div>
    </div>
  );
}

export default Banner;