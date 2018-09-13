import 'core-js/es6/map';
import 'core-js/es6/set';
import 'babel-polyfill';
import React, { Component } from 'react';
import { render } from 'react-dom';

import App from './App';
import 'antd/dist/antd.less';
import './styles/index.scss';
import registerServiceWorker from './registerServiceWorker';
import fetchEnv from './fetchEnv';

registerServiceWorker();

export class Index extends Component {
  constructor() {
      super();
      this.state = {environment: false};
      fetchEnv().then(() => {
        this.setState({environment: true});
      });
  }
  render() {
    if (this.state.environment) {
      return (
        <App />
      )
    }else {
      return(<div></div>)
    }
  }
}

render(<Index />, document.getElementById('root'));