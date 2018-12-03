import DevTools from 'mobx-react-devtools';
import React, { Component } from 'react';
import {
  Route, RouteComponentProps,
  Switch, withRouter,
} from 'react-router-dom';

import './App.pcss';
import MainPage from './modules/main/pages/MainPage/MainPage';
import NoMatchPage from './modules/main/pages/NoMatchPage/NoMatchPage';
import MTDetailsPage from './modules/multitoken/pages/MTDetailsPage/MTDetailsPage';


const ENV_DEV = process.env.NODE_ENV === 'development';

class App extends Component<RouteComponentProps<any>, any> {
  componentDidUpdate(prevProps: RouteComponentProps<any>) {
    // Scroll Restoration after route change.
    // https://reacttraining.com/react-router/web/guides/scroll-restoration
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    return (
      <div className="App">
        {ENV_DEV && <DevTools position={{ bottom: 0, right: 20 }} />}

        <Switch>
          <Route exact path="/" component={MainPage} />
          <Route path="/multitokens/:id" component={MTDetailsPage} />
          <Route path="/multicoins/:id" render={props => <MTDetailsPage isCoin {...props} />} />
          <Route component={NoMatchPage} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
