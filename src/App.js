import React, { Component } from 'react';
import './App.css';
import SFMap from './SFMap';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {route: ''};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({route: event.target.value});
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>SF City Bus Map</h2>
          <div id="Route-select">
            <label className="select-lable" htmlFor="Route-select">Choose your route:</label>
            <select className="route-select" value={this.state.route} onChange={this.handleChange}>
              <option value="">All</option>
              <option value="N">N</option>
              <option value="6">6</option>
              <option value="22">22</option>
              <option value="8">8</option>
            </select>
          </div>
        </div>
        <div>
          <SFMap routeTag={this.state.route}/>
        </div>
      </div>
    );
  }
}

export default App;
