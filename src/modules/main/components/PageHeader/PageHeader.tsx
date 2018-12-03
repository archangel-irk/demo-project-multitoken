import { Col, Row } from 'antd';
import React, { Component } from 'react';
import {
  Link,
} from 'react-router-dom';

import logoSvg from './logo.svg';
import s from './PageHeader.pcss';


class PageHeader extends Component {
  render() {
    return (
      <Row
        className={s.container}

        type="flex"
      >
        <Col
          className={s.content}
          xs={{ span: 22, offset: 1 }}
          lg={{ span: 20, offset: 2 }}
          xl={{ span: 16, offset: 4 }}
        >
          <Link
            to="/"
            className={s.logo}
          >
            <img className={s.logoImg} alt="logo" src={logoSvg} />
            <span className={s.alphaLabel}>alpha</span>
          </Link>
          <span className={s.description}>
              Crypto baskets/funds/indexes
          </span>
          <a href="https://example.com" target="_blank" style={{ marginLeft: 'auto' }}>About MultiToken</a>
        </Col>
      </Row>
    );
  }
}

export default PageHeader;
