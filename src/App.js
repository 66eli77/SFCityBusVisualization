import React, { Component } from 'react';
import './App.css';
import SFBusMap from './SFBusMap';
import { xml } from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      route: '',
      routes: [],
    };
    this.routeListUrl = 'http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni',
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    xml(this.routeListUrl, xml => {
        this.setState({routes: xml.documentElement.getElementsByTagName('route')});
      }
    );
  }

  handleChange(event) {
    this.setState({route: event.target.value});
  }

  render() {
    return (
      <div className='App'>
        <div className='App-header'>
          <h2>SF City Bus Map</h2>
          <div id='Route-select'>
            <label className='select-lable' htmlFor='Route-select'>Choose your route:</label>
            <select className='route-select' value={this.state.route} onChange={this.handleChange}>
              <option value=''>All</option>
              {
                Array.prototype.map.call(this.state.routes, function(r) {
                  return <option key={r.getAttribute('tag')} value={r.getAttribute('tag')}>{r.getAttribute('title')}</option>;
                })
              }
            </select>
          </div>
        </div>
        <div>
          <SFBusMap routeTag={this.state.route}/>
        </div>
      </div>
    );
  }
}

export default App;
