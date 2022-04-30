import React from 'react';
import images from '../../assets';

// Header
export default (props) => (
  <header className="header">
    <div className="container-fluid">
      <img style={{padding: '2rem'}} src={images.cylogo} role="presentation" />
    </div>
  </header>
);
