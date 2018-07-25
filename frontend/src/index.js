import React from 'react';
import { render } from 'react-dom';

import App from './App';
import 'antd/dist/antd.less';
import './styles/index.scss';
import registerServiceWorker from './registerServiceWorker';

render(<App />, document.getElementById('root'));

registerServiceWorker();
