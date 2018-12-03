import { observer } from 'mobx-react';
import React, { Component } from 'react';

// import MCList from '../../../multicoin/components/MCList/MCList';
import { MCListModel } from '../../../multicoin/components/MCList/MCList.model';
import MTList from '../../../multitoken/components/MTList/MTList';
import { MTListModel } from '../../../multitoken/components/MTList/MTList.model';
import MTMyList from '../../../multitoken/components/MTMyList/MTMyList';
import { MTMyListModel } from '../../../multitoken/components/MTMyList/MTMyList.model';
import PageContent from '../../components/PageContent/PageContent';
import PageFooter from '../../components/PageFooter/PageFooter';
import PageHeader from '../../components/PageHeader/PageHeader';

import s from './MainPage.pcss';


@observer
class MainPage extends Component {
  MTMyList: MTMyListModel;
  MTListModel: MTListModel;
  MCListModel: MCListModel;
  isCoinsShow = true;

  constructor(props: any) {
    super(props);

    this.MTMyList = new MTMyListModel();
    this.MTListModel = new MTListModel();
    this.MCListModel = new MCListModel();
    // this.isCoinsShow = props.location.search === '?coins';
  }

  componentDidMount() {
    this.load();
  }

  load() {
    this.MTMyList.load();
    this.MTListModel.load(this.isCoinsShow);
    // this.MCListModel.load();
  }

  render() {
    return (
      <div className={s.container}>
        <PageHeader />
        <PageContent>
          {this.MTMyList.data.length > 0 &&
            <section className={`${s.section} ${s.myTokens}`}>
              <header className={s.sectionHeader}>My Tokens</header>
              <div className={s.sectionContent}>
                <div className={s.myTokensTable}>
                  <MTMyList
                    dataSource={this.MTMyList.data}
                  />
                </div>
              </div>
            </section>
          }

          <section className={`${s.section} ${s.multiTokens}`}>
            <header className={s.sectionHeader}>MultiTokens</header>
            <div className={s.sectionContent}>
              <div className={s.multiTokensTable}>
                <MTList
                  isLoading={this.MTListModel.isLoading}
                  dataSource={this.MTListModel.data}
                />
              </div>
            </div>
          </section>

          {/*this.isCoinsShow &&
            <section className="MainPage__section MultiCoins-section">
              <header className={s.sectionHeader}>MultiCoins</header>
              <div className={s.sectionContent}>
                <div className="MainPage__coin-table">
                  <MCList
                    isLoading={this.MCListModel.isLoading}
                    dataSource={this.MCListModel.data}
                  />
                </div>
              </div>
            </section>
          */}
        </PageContent>
        <PageFooter />
      </div>
    );
  }
}

export default MainPage;
