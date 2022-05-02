import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Route
} from 'react-router-dom'

import {
	Mainnet,
	DAppProvider,
	useEtherBalance,
	useEthers,
	Config,
} from '@usedapp/core'
import { formatEther } from '@ethersproject/units'
import { getDefaultProvider } from 'ethers'

import './index.css';
import AppLayout from './components/dashboard/AppLayout';

import HomePage from './components/dashboard/pages/Home';
import ShowResults from './components/dashboard/pages/ShowResults';
// import RegisterPage from './components/landing/pages/Register';
// import LoginPage from './components/landing/pages/Login';

const REQUEST_FACTORY_CONTRACT = '0x7fdC14F1E74955f62b2d95Ac1f41A9aBFa003F23'

const config: Config = {
	readOnlyChainId: Mainnet.chainId,
	readOnlyUrls: {
		[Mainnet.chainId]: getDefaultProvider('mainnet'),
	},
}


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			input: ''
		};
	}

	render() {
		return (
			<Router history={history}>
				<div>
					{/* <Route path="/login" component={LoginPage} />
					<Route path="/register" component={RegisterPage} /> */}

					<Route exact path="/" component={() =>
						<AppLayout>
							<HomePage  {...this.state} />
						</AppLayout>
					} />

					<Route exact path="/results" component={() =>
						<AppLayout>
							<ShowResults {...this.state} />
						</AppLayout>
					} />

				</div>
			</Router>
		);
	}
}

ReactDOM.render(
	<DAppProvider config={config}>
		<App />
	</DAppProvider>,
	document.getElementById('root')
);
