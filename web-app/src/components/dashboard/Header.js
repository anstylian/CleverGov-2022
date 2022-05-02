import React, { Component } from 'react';
import images from '../../assets';
import {
  useEthers,
} from '@usedapp/core'

// // Header
// export default (props) => (
//   <header className="header">
//     <div className="container-fluid">
//       <img style={{ padding: '2rem' }} src={images.cylogo} role="presentation" />
//     </div>
//   </header>
// );

// class Header extends Component {
const Header = () => {
  const { activateBrowserWallet, account } = useEthers();
  return (
    <header className="header">
      <div className="container-fluid">
        <img style={{ padding: '2rem' }} src={images.cylogo} role="presentation" />
        {!account &&
          <button
            style={{ width: '8rem', height: '4rem', borderRadius: '0.5rem', marginLeft: '10px' }} 
            onClick={() => activateBrowserWallet()}>
            Connect
          </button>
        }
      </div>
    </header>
  );
}

export default Header;
