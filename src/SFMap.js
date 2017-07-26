import React, { Component } from 'react';
import neighborhoods from './sfmaps/neighborhoods.json';
import streets from './sfmaps/streets.json';
import freeways from './sfmaps/freeways.json';
import arteries from './sfmaps/arteries.json';
import { geoAlbers, geoPath, select, transition, xml } from 'd3';

class SFMap extends Component {

  constructor(props){
    super(props);
    this.state = {
      // bus location data url
      url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=',
      // last bus location fetch time
      lastTime: null,
      // route tag
      routeTag: '',
    };
  }

  componentDidMount() {
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
        const fleet = select(this.node).selectAll('.bus')
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
        setInterval(() => this.updateBusLocation(fleet, projection), 5000);
      }
    );

    this.drawMap(path);
  }

  componentWillReceiveProps(nextProps) {
    // console.log('nnnNNNN::: ', nextProps.routeTag, ' --- ', this.props.routeTag);
    if(nextProps.routeTag !== this.props.routeTag) {
      if(nextProps.routeTag){
        select(this.node).selectAll('.tag-' + nextProps.routeTag)
          .style("opacity", '1');
        select(this.node).selectAll('.bus').filter(d => d.getAttribute('routeTag') !== nextProps.routeTag)
          .style("opacity", '0');
        this.setState({routeTag: '&r=' + nextProps.routeTag});
      }else{
        select(this.node).selectAll('.bus').style("opacity", '1');
        this.setState({routeTag: ''});
      }
    }
  }

  updateBusLocation(fleet, projection) {
    xml(this.state.url + this.state.lastTime + this.state.routeTag, xml => {
      fleet.data(xml.documentElement.getElementsByTagName('vehicle'), d => d.getAttribute('id'))
        // .transition().duration(3000).ease(transition.easeSin)
        .attr('cx', d => projection([d.getAttribute('lon'), d.getAttribute('lat')])[0])
        .attr('cy', d => projection([d.getAttribute('lon'), d.getAttribute('lat')])[1]);

      //set last bus location fetch time
      this.setState({lastTime: xml.documentElement.getElementsByTagName('lastTime')[0].getAttribute('time')});
    });
  }

  drawMap(path) {
    // draw the neighborhoods
    select(this.node)
      .selectAll('path').data(neighborhoods.features).enter().append('path')
      .attr('d', path)
      .style('fill', '#fcdfdb')
      .style('stroke-width', '1')
      .style('stroke', 'orange');
     
    // draw the streets
    select(this.node)
      .selectAll('path').data(streets.features).enter().append('path')
      .attr('d', path)
      .style('fill', 'transparent')
      .style('stroke-width', '0.5')
      .style('stroke', 'green');
     
    // draw the arteries
    select(this.node)
      .selectAll('LineString').data(arteries.features).enter().append('path')
      .attr('d', path)
      .style('fill', 'transparent')
      .style('stroke-width', '2')
      .style('stroke', '#4286f4');

    // draw the freeways
    select(this.node)
      .selectAll('LineString').data(freeways.features).enter().append('path')
      .attr('d', path)
      .style('fill', 'transparent')
      .style('stroke-width', '3')
      .style('stroke', '#82d85d');
  }

  render() {
    return <svg ref={node => this.node = node} width={window.innerWidth} height={window.innerHeight}></svg>;
  }
}
export default SFMap;