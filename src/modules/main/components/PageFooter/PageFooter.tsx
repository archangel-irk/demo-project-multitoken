import { Col, Row } from 'antd';
import React, { Component } from 'react';

import logoFacebookSvg from './logo-fb.svg'; // fb - because of adBlock
import logoMediumSvg from './logo-medium.svg';
import logoTelegramSvg from './logo-telegram.svg';
import logoTwitterSvg from './logo-twtr.svg'; // twtr - because of adBlock
import s from './PageFooter.pcss';


class PageFooter extends Component {
  // Be aware of adBlock.
  // Use true 'alt' attr values.
  render() {
    const version = process.env.REACT_APP_VERSION;

    return (
      <Row
        className={s.container}
        justify="center"
        type="flex"
        // gutter={100}
      >
        <Col
          className={`${s.section} ${s.social}`}
          xs={{ span: 22, offset: 1, order: 2 }}
          sm={{ span: 8 }}
          md={{ span: 6 }}
          xl={{ span: 4 }}
        >
          <header className={s.header}>Connect With Us</header>
          <div className={s.socialLinks}>
            <div className={s.socialLink}>
              <a href="https://example.com" target="_blank">
                <img alt="Medium page" src={logoMediumSvg} />
              </a>
            </div>
            <div className={s.socialLink}>
              <a href="https://example.com" target="_blank">
                <img alt="Telegram channel" src={logoTelegramSvg} />
              </a>
            </div>
            <div className={s.socialLink}>
              <a href="https://example.com" target="_blank">
                <img alt="Facebook page" src={logoFacebookSvg} />
              </a>
            </div>
            <div className={s.socialLink}>
              <a href="https://example.com" target="_blank">
                <img alt="Twitter page" src={logoTwitterSvg} />
              </a>
            </div>
          </div>
        </Col>
        <Col
          className={`${s.section} ${s.about}`}
          xs={{ span: 22, offset: 1 }}
          sm={{ span: 8, offset: 1 }}
          md={{ span: 6, offset: 1 }}
          xl={{ span: 4, offset: 1 }}
        >
          <header className={s.header}>About Us</header>
          <div className={s.aboutLinks}>
            <div className={s.aboutLink}>
              <a href="https://example.com" target="_blank">MultiToken Protocol</a>
            </div>
            <div className={s.aboutLink}>
              <a href="https://example.com" target="_blank">How It Works</a>
            </div>
            <div className={s.aboutLink}>
              <a href="https://example.com" target="_blank">Team</a>
            </div>
          </div>
          <code className={s.version}>
            v{version ? version : ' SECRET'}
          </code>
        </Col>
      </Row>
    );
  }
}

export default PageFooter;
