import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'

import './index.css';
import AppLayout from './components/dashboard/AppLayout';

import HomePage from './components/dashboard/pages/Home';
import ShowResults from './components/dashboard/pages/ShowResults';
// import RegisterPage from './components/landing/pages/Register';
// import LoginPage from './components/landing/pages/Login';

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
	<App />,
	document.getElementById('root')
);
