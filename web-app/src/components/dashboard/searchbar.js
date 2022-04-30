import React from "react";
import { withRouter } from "react-router-dom";

class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
      }

    handleSubmit = (history) => {
        const data = {
            time: 123
        }
        console.log(data)
        console.log(this.props)
        
        history.push('/results', {data})
    }
    
    handleChange(event) {this.setState({value: event.target.value});  }
    

    render() {
        const { match, location, history } = this.props;
        return (
            <div style={{display:'block', marginLeft:'auto', marginRight:'auto', width:'50%'}}>
            <form onSubmit={() => this.handleSubmit(history)}>
                <input
                    style={{width:'30rem', height:'4rem', borderRadius:'0.5rem'}}
                    type="text"
                    id="header-search"
                    placeholder="Application #"
                    onChange={this.handleChange}
                />
                <button 
                    type="submit"
                    style={{width:'8rem', height:'4rem', borderRadius:'0.5rem', marginLeft:'10px'}}
                >Search</button>
            </form>
    </div>
        )
    }
}

export default withRouter(SearchBar);