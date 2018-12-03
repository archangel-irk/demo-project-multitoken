import { Layout } from 'antd';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';

import PageContent from '../../components/PageContent/PageContent';
import PageFooter from '../../components/PageFooter/PageFooter';
import PageHeader from '../../components/PageHeader/PageHeader';


class NoMatchPage extends Component<RouteComponentProps<any>, any> {
  render() {
    const { location } = this.props;

    return (
      <Layout className="NotFoundPage" style={{ minHeight: '100vh' }}>
        <PageHeader />
        <PageContent>
          <div
            style={{
              padding: 20,
            }}
          >
            <h1>404</h1>
            <h3>No match for <code>{location.pathname}</code></h3>
          </div>
        </PageContent>
        <PageFooter />
      </Layout>
    );
  }
}

export default NoMatchPage;
