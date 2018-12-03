import { Col, Row } from 'antd';
import React, { Component } from 'react';

import s from './PageContent.pcss';


class PageContent extends Component {
  render() {
    return (
      <Row
        className={s.container}
        type="flex"
      >
        <Col
          xs={{ span: 22, offset: 1 }}
          sm={{ span: 22, offset: 1 }}
          md={{ span: 22, offset: 1 }}
          lg={{ span: 20, offset: 2 }}
          xl={{ span: 18, offset: 3 }}
          xxl={{ span: 16, offset: 4 }}
        >
          {this.props.children}
        </Col>
      </Row>
    );
  }
}

export default PageContent;
