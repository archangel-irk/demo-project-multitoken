import { Button, Progress, Spin, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';

import { MultiCoinDetail, MultiCoinItem } from '../../../../services/multicoin.service';
import { MultiTokenDetail, MultiTokenItem } from '../../../../services/multitoken.service';
import { BreakPoints, viewPortWidth } from '../../../../utils/browser';
import { formatNumberShort } from '../../../../utils/format';
import { Locale } from '../../../../utils/locale';
import { isMultiCoinDetail, isToken } from '../../../../utils/utils';
import PageContent from '../../../main/components/PageContent/PageContent';
import PageFooter from '../../../main/components/PageFooter/PageFooter';
import PageHeader from '../../../main/components/PageHeader/PageHeader';
import { multiCoinMessage, sendMultiCoinEvent } from '../../../multicoin/utils';
import MTBuyButton from '../../components/MTBuyButton/MTBuyButton';
import MTPriceChart from '../../components/MTPriceChart/MTPriceChart';
import MTSellButton from '../../components/MTSellButton/MTSellButton';

import MTDetailsDefaultSvg from './logo-mtkn.svg';
import { MTDetailsModel } from './MTDetails.model';
import s from './MTDetailsPage.pcss';


interface Params {
  // address for MultiTokens or uid for MultiCoins
  id?: string;
}

interface Props {
  isCoin?: boolean;
}

@observer
class MTDetailsPage extends Component<Props & RouteComponentProps<Params>, any> {
  model: MTDetailsModel;

  constructor(props: Props & RouteComponentProps<Params>) {
    super(props);

    const params = this.props.match.params;
    this.model = new MTDetailsModel(params.id, this.props.isCoin);
  }

  componentDidMount() {
    this.model.load();
  }

  renderNotFound() {
    return (
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <h1>The MultiToken not found</h1>
        <p>
          That’s all we know.
        </p>
      </div>
    );
  }

  renderActions(item: MultiTokenDetail | MultiCoinDetail) {
    if (isMultiCoinDetail(item)) {
      return (
        <>
          <Tooltip title={multiCoinMessage} trigger="click">
            <Button
              type="primary"
              style={{
                padding: '0 20px',
                marginRight: viewPortWidth >= BreakPoints.XL ? 20 : 10
              }}
              onClick={() => {
                sendMultiCoinEvent(item.name, item.symbol);
              }}
            >
              {Locale.BUY}
            </Button>
          </Tooltip>
          <Tooltip title={multiCoinMessage} trigger="click">
            <Button
              type="danger"
              style={{ padding: '0 20px' }}
              onClick={() => {
                sendMultiCoinEvent(item.name, item.symbol);
              }}
            >
              {Locale.SELL}
            </Button>
          </Tooltip>
        </>
      );
    }

    return (
      <>
        <MTBuyButton
          buttonStyle={{
            marginRight: 20,
          }}
          multiToken={item}
        />
        <MTSellButton
          symbol={item.symbol}
          address={item.address}
        />
      </>
    )
  }

  renderChange(value: number) {
    if (value > 0) {
      return <span className={`${s.change} ${s.changeUp}`}>{value}%</span>;
    } else if (value < 0) {
      return <span className={`${s.change} ${s.changeDown}`}>{value}%</span>;
    }

    // value == 0
    return <span className={s.change}>0%</span>;
  }

  renderDetails() {
    if (!this.model.data) return null;

    const multiToken = this.model.data;
    return (
      <div className={s.main}>
        <div className={s.mainHeader}>
          <img className={s.mTokenImg} alt="icon" src={multiToken.icon || MTDetailsDefaultSvg} />
          <div
            style={{
              marginRight: 'auto',
            }}
          >
            <div className={s.mTokenName}>{multiToken.name}</div>
            <div className={s.mTokenSymbol}>{multiToken.symbol}</div>
          </div>
          <div className={s.actions}>
            {this.renderActions(multiToken)}
          </div>
        </div>

        {multiToken.description &&
          <div className={s.description}>
            <div className={s.descriptionLabel}>Description:</div>
            {multiToken.description}
          </div>
        }

        <div className={s.actions}>
          {this.renderActions(multiToken)}
        </div>

        <div className={s.numbers}>
          <div className={s.number}>
            <div className={s.numberTitle}>Price:</div>
            <div className={s.numberValue}>${multiToken.price}</div>
            {/*<div className="MTDetailsPage__numbers-second-value">&ndash;&nbsp;Eth</div>*/}
          </div>

          <div className={s.number}>
            <div className={s.numberTitle}>Change (24h):</div>
            <div className={s.numberValue}>
              {this.renderChange(multiToken.percentChange24H)}
            </div>
            {/*<div className="MTDetailsPage__numbers-second-value">&ndash;&nbsp;Eth</div>*/}
          </div>

          {/*<div className="MTDetailsPage__number">
            <div className="MTDetailsPage__numbers-title">Market Cap:</div>
            <div className="MTDetailsPage__numbers-value">$&mdash;</div>
            <div className="MTDetailsPage__numbers-second-value">&ndash;&nbsp;Eth</div>
          </div>*/}
        </div>
      </div>
    );
  }

  renderProfitUsd(text: string) {
    const value = parseFloat(text);
    if (value > 0) {
      return (
        <span className={`${s.profit} ${s.profitUp}`}>
          $&#8288;{formatNumberShort(value, 'm')}
        </span>
      );
    } else if (value < 0) {
      return (
        <span className={`${s.profit} ${s.profitDown}`}>
          −&#8288;$&#8288;{formatNumberShort(Math.abs(value), 'm')}
        </span>
      );
    }

    // value == 0
    return <span className={s.profit}>$0</span>;
  }

  renderWallet() {
    if (!this.model.walletData) return null;

    const wallet = this.model.walletData;

    return (
      <div className={s.wallet}>
        <div className={`${s.walletItem} ${s.walletAmount}`}>
          <div className={s.walletLabel}>Amount:</div>
          <div className={s.walletValue}>
            {formatNumberShort(wallet.amount, 'm')}&nbsp;{wallet.multiToken.symbol}
          </div>
        </div>
        <div className={`${s.walletItem} ${s.walletPrice}`}>
          <div className={s.walletLabel}>Price:</div>
          <div className={s.walletValue}>-</div>
        </div>
        <div className={`${s.walletItem} ${s.walletProfit}`}>
          <div className={s.walletLabel}>Profit:</div>
          <div className={s.walletValue}>
            {this.renderProfitUsd(wallet.profitUsd)}
          </div>
        </div>
      </div>
    );
  }

  renderTokenIcon(iconUrl: string) {
    if (!iconUrl) return '';
    return (
      <img className={s.tokenImg} alt="icon" src={iconUrl} />
    );
  }

  renderTokenItem(item: MultiTokenItem | MultiCoinItem) {
    const token = isToken(item) ? item.token : item.coin;
    return (
      <div className={s.token} key={token.uid}>
        <Progress
          className={s.tokenPercentIndicator}
          type="circle"
          width={60}
          strokeWidth={7}
          percent={item.percent}
          // @ts-ignore
          format={() => this.renderTokenIcon(token.icon)}
        />
        <div className={s.tokenInfo}>
          <div className={s.tokenName}>{token.name}</div>
          <div className={s.tokenPercent}>{item.percent}%</div>
        </div>
      </div>
    )
  }

  renderTokenItems(items: Array<MultiTokenItem | MultiCoinItem>) {
    return items.map((item) => {
      return this.renderTokenItem(item);
    })
  }

  render() {
    return (
      <div className={s.container}>
        <PageHeader />
        <PageContent>
          <section className={s.section}>
            <div className={s.content}>
              <Spin
                spinning={this.model.isLoading}
                delay={1000}
                tip="Loading..."
              >
                <div
                  style={{
                    minHeight: 180,
                  }}
                >
                  {this.model.isNotFound
                    ? this.renderNotFound()
                    : this.renderDetails()
                  }
                </div>
              </Spin>
            </div>
          </section>

          {this.model.walletData &&
            <section className={s.section}>
              <div className={s.content}>
                {this.renderWallet()}
              </div>
            </section>
          }

          {this.model.data &&
            <section className={s.section}>
              <div className={s.content}>
                <MTPriceChart
                  id={this.model.data.address || this.model.data.uid}
                  symbol={this.model.data.symbol}
                  isCoin={this.props.isCoin}
                />
              </div>
            </section>
          }

          {this.model.data &&
            <section className={s.section}>
              <div className={s.content}>
                <div className={s.tokens}>
                  <div className={s.tokensHeader}>Tokens:</div>
                  <div className={s.tokensWrapper}>
                    {this.renderTokenItems(this.model.data.items)}
                  </div>
                </div>
              </div>
            </section>
          }
        </PageContent>
        <PageFooter />
      </div>
    );
  }
}

export default MTDetailsPage;
