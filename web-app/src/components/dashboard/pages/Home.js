import React from 'react';
import SearchBar from '../searchbar';

export default class MainPanel extends React.Component {

  constructor(props) {
    super(props)
		this.props = props;
	}

  render() {
    return (
      <div className="container-fluid">
        <SearchBar {...this.props}/>
      </div>
    );
  }
}
