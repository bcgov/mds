import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes/Routes';
import { hot } from 'react-hot-loader'

class App extends Component {
  render() {
    return(
        <BrowserRouter basename={process.env.BASE_PATH}>
          <Routes />
        </BrowserRouter>
    );
  }
}

export default hot(module)(App)
