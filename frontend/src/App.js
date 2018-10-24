import React, { Component, Fragment } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from './store/configureStore';
import Routes from './routes/Routes';
import { hot } from 'react-hot-loader'
import ModalWrapper from '@/components/common/ModalWrapper';

export const store = configureStore();

class App extends Component {
  render() {
    return(
      <Provider store={store}>
        <BrowserRouter basename={process.env.BASE_PATH}>
        <Fragment >
          <Routes />
          <ModalWrapper />
        </Fragment>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default hot(module)(App)
