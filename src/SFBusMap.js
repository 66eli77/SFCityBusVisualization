import React, { Component } from 'react';
import neighborhoods from './sfmaps/neighborhoods.json';
import streets from './sfmaps/streets.json';
import freeways from './sfmaps/freeways.json';
import arteries from './sfmaps/arteries.json';
import { geoAlbers, geoPath, select, easeSin, xml } from 'd3';

class SFBusMap extends Component {

  constructor(props){
    super(props);
    this.state = {
      svg: null,
      // bus location data url
      url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=',
      // last bus location fetch time
      lastTime: null,
      // route tag
      routeTag: '',
    };
  }

  renderMap() {
    // create a unit projection
    const projection = geoAlbers().scale(1).translate([0,0]);
    // create a path generator.
    const path = geoPath().projection(projection);
    // compute bounds of a point of interest, then derive scale and translate
    const b = path.bounds(neighborhoods),
        s = .95 / Math.max((b[1][0] - b[0][0]) / window.innerWidth, (b[1][1] - b[0][1]) / window.innerHeight),
        t = [(window.innerWidth - s * (b[1][0] + b[0][0])) / 2, (window.innerHeight - s * (b[1][1] + b[0][1])) / 2];
    // update the projection to use computed scale and translate....
    projection.scale(s).translate(t);

    xml(this.state.url + '0' + this.state.routeTag, xml => {
        // draw the buses
        const fleet = this.state.svg.selectAll('.bus')
          .data(xml.documentElement.getElementsByTagName('vehicle'), d => d.getAttribute('id'))
          .enter().append('circle')
          .attr('cx', d => projection([d.getAttribute('lon'), d.getAttribute('lat')])[0])
          .attr('cy', d => projection([d.getAttribute('lon'), d.getAttribute('lat')])[1])
          .attr('r', 3)
          .attr('id', d => d.getAttribute('id'))
          .attr('class', d => 'bus ' + 'tag-' + d.getAttribute('routeTag'))
          .style('fill', 'red');

        //set last bus location fetch time
        this.setState({lastTime: xml.documentElement.getElementsByTagName('lastTime')[0].getAttribute('time')});

        // update the bus locations every 15 secs
        setInterval(() => this.updateBusLocation(fleet, projection), 15000);
      }
    );

    this.drawMap(path);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.routeTag !== this.props.routeTag) {
      if(nextProps.routeTag){
        this.state.svg.selectAll('.tag-' + nextProps.routeTag)
          .style('opacity', '1');
        this.state.svg.selectAll('.bus').filter(d => d.getAttribute('routeTag') !== nextProps.routeTag)
          .style('opacity', '0');
        this.setState({routeTag: '&r=' + nextProps.routeTag});
      }else{
        this.state.svg.selectAll('.bus').style('opacity', '1');
        this.setState({routeTag: ''});
      }
    }
  }

  onRef = (ref) => {
    this.setState({ svg: select(ref) }, () => this.renderMap(this.props.data))
  }

  updateBusLocation(fleet, projection) {
    xml(this.state.url + this.state.lastTime + this.state.routeTag, xml => {
      fleet.data(xml.documentElement.getElementsByTagName('vehicle'), d => d.getAttribute('id'))
        .transition().duration(3000).ease(easeSin)
        .attr('cx', d => projection([d.getAttribute('lon'), d.getAttribute('lat')])[0])
        .attr('cy', d => projection([d.getAttribute('lon'), d.getAttribute('lat')])[1]);

      //set last bus location fetch time
      this.setState({lastTime: xml.documentElement.getElementsByTagName('lastTime')[0].getAttribute('time')});
    });
  }

  drawMap(path) {
    // draw the neighborhoods
    this.state.svg
      .selectAll('path').data(neighborhoods.features).enter().append('path')
      .attr('d', path)
      .style('fill', '#fcdfdb')
      .style('stroke-width', '1')
      .style('stroke', 'orange');
     
    // draw the streets
    this.state.svg
      .selectAll('path').data(streets.features).enter().append('path')
      .attr('d', path)
      .style('fill', 'transparent')
      .style('stroke-width', '0.5')
      .style('stroke', 'green');
     
    // draw the arteries
    this.state.svg
      .selectAll('LineString').data(arteries.features).enter().append('path')
      .attr('d', path)
      .style('fill', 'transparent')
      .style('stroke-width', '2')
      .style('stroke', '#4286f4');

    // draw the freeways
    this.state.svg
      .selectAll('LineString').data(freeways.features).enter().append('path')
      .attr('d', path)
      .style('fill', 'transparent')
      .style('stroke-width', '3')
      .style('stroke', '#82d85d');
  }

  render() {
    return <svg ref={this.onRef} width={window.innerWidth} height={window.innerHeight}></svg>;
  }
}
export default SFBusMap;