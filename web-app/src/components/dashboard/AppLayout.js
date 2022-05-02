import React, { Component } from 'react';

import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

// class AppLayout extends Component {
// 	render() {
// 		return (
const AppLayout = (props) => {
	return (
		<div className="wrapper">
			{/* <Sidebar /> */}
			<div className="main-panel">
				<Header />
				<div className="content">
					{props.children} {/* This will be one Route/Page at a time */}
				</div>
				<Footer />
			</div>
		</div>
	);
}
// }

export default AppLayout;
