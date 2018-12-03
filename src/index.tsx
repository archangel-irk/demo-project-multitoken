// Init sentry logger before other code.
import './utils/sentry';
// tslint:disable-next-line:ordered-imports
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Router,
} from 'react-router-dom';

import App from './App';
import './theme.css';
import history from './utils/history';


ReactDOM.render(
  <React.StrictMode>
    <Router history={history}>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
);
