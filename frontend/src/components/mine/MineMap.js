import React, { Component } from 'react';
import { LOCATION_PIN } from '@/constants/assets';
import { Map, loadModules } from 'react-arcgis';

class MineMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graphic: null
    };
  }
  renderMap = () => {
    return (
      <Map
        style={{ width: '100vw', height: '475px' }}
        mapProperties={{ basemap: 'streets' }}
        viewProperties={{
          center: [-114.655, 49.513],
          zoom: 8
        }}
      />
    );
  }
  componentWillMount() {
    console.log(this);
    console.log(this.renderMap());
    loadModules(['esri/Graphic']).then(([Graphic]) => {
      // Create a polygon geometry
      const polygon = {
        type: "polygon", // autocasts as new Polygon()
        rings: [
          [-64.78, 32.3],
          [-66.07, 18.45],
          [-80.21, 25.78],
          [-64.78, 32.3]
        ]
      };

      // Create a symbol for rendering the graphic
      const fillSymbol = {
        type: "simple-fill", // autocasts as new SimpleFillSymbol()
        color: [227, 139, 79, 0.8],
        outline: { // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 1
        }
      };

      // Add the geometry and symbol to a new graphic
      const graphic = new Graphic({
        geometry: polygon,
        symbol: fillSymbol
      });

      this.setState({ graphic });
      this.props.view.graphics.add(graphic);
    });
  }

  componentWillUnmount() {
    this.props.view.graphics.remove(this.state.graphic);
  }

  render() {
    return (
      <div>
     {this.renderMap()}
     </div>
    );
  }
}

export default MineMap;