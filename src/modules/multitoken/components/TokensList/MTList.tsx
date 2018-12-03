import { Button, Table, Tooltip } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import {
  Link,
} from 'react-router-dom';
// @ts-ignore
import { Sparklines, SparklinesCurve } from 'react-sparklines';

import { MultiCoinShort } from '../../../../services/multicoin.service';
import { MultiToken } from '../../../../services/multitoken.service';
import { BreakPoints, viewPortWidth } from '../../../../utils/browser';
import { formatNumberShort, formatPercent } from '../../../../utils/format';
import { Locale } from '../../../../utils/locale';
import { isMultiCoin } from '../../../../utils/utils';
import { multiCoinMessage, sendMultiCoinEvent } from '../../../multicoin/utils';
import MTBuyButton from '../MTBuyButton/MTBuyButton';
import MTSellButton from '../MTSellButton/MTSellButton';

import s from './MTList.pcss';
import multiTokenDefaultSvg from './multitoken-default.svg';


type IDataItem = MultiToken | MultiCoinShort;

function renderColumnNameHeader() {
  return (
    <div className={s.columnNameHeader}>
      Name
    </div>
  );
}

function renderName(name: string, record: IDataItem, index: number) {
  const link = record.isToken
    ? `multitokens/${record.address}`
    : `multicoins/${record.uid}`;

  return (
    <Link
      className={`${s.cell} ${s.token}`}
      to={link}
      title={name}
    >
      <div className={s.tokenPosition}>{index + 1}</div>
      <img className={s.tokenImg} alt="icon" src={record.icon || multiTokenDefaultSvg} />
      <div className={s.tokenNameAndTicker}>
        <div className={s.tokenName}>{name}</div>
        <div className={s.tokenTicker}>{record.symbol}</div>
      </div>
    </Link>
  );
}

function getChangeElement(change: number) {
  const changeFormatted = formatPercent(change);
  // If percentChange === 0 - default
  let changeElement = <span className={s.change}>{changeFormatted}%</span>;

  if (change > 0) {
    changeElement = <span className={`${s.change} ${s.changeUp}`}>↑{changeFormatted}%</span>;
  } else if (change < 0) {
    changeElement = <span className={`${s.change} ${s.changeDown}`}>↓{changeFormatted}%</span>;
  }

  return changeElement;
}

function renderChange(change: number, record: IDataItem, index: number) {
  const link = record.isToken
    ? `multitokens/${record.address}`
    : `multicoins/${record.uid}`;

  return (
    <Link
      className={`${s.cell} ${s.changeLink}`}
      to={link}
    >
      {getChangeElement(change)}
    </Link>
  );
}

function renderPrice(value: any, record: IDataItem, index: number) {
  const link = record.isToken
    ? `multitokens/${record.address}`
    : `multicoins/${record.uid}`;

  return (
    <Link
      className={`${s.cell} ${s.price}`}
      to={link}
    >
      <div>
        <div>${formatNumberShort(value)}</div>
        {getChangeElement(record.percentChange24H)}
      </div>
    </Link>
  );
}

function renderChart(text: any, record: IDataItem, index: number) {
  const data = record.historyPrices.map(history => history.price);
  let chartWidth = 60;
  let chartHeight = 40;

  if (viewPortWidth >= BreakPoints.LG) {
    chartWidth = 170;
    chartHeight = 63;
  }

  const link = record.isToken
    ? `multitokens/${record.address}`
    : `multicoins/${record.uid}`;

  return (
    <Link
      className={`${s.cell} ${s.chart}`}
      to={link}
    >
      <Sparklines data={data} width={chartWidth} height={chartHeight} margin={5}>
        <SparklinesCurve color="#505fc4" />
      </Sparklines>
    </Link>
  );
}

function renderActions(text: any, record: IDataItem, index: number) {
  if (isMultiCoin(record)) {
    return (
      <div className={`${s.cell} ${s.actions}`}>
        <Tooltip title={multiCoinMessage} trigger="click">
          <Button
            type="primary"
            className={`${s.action} ${s.multiCoinBuy}`}
            onClick={() => {
              sendMultiCoinEvent(record.name, record.symbol);
            }}
          >
            {Locale.BUY}
          </Button>
        </Tooltip>
        <Tooltip title={multiCoinMessage} trigger="click">
          <Button
            type="danger"
            className={`${s.action} ${s.multiCoinSell}`}
            onClick={() => {
              sendMultiCoinEvent(record.name, record.symbol);
            }}
          >
            {Locale.SELL}
          </Button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={`${s.cell} ${s.actions}`}>
      <MTBuyButton
        className={s.action}
        multiToken={record}
      />
      <MTSellButton
        className={s.action}
        symbol={record.symbol}
        address={record.address}
      />
    </div>
  )
}

const columns: Array<ColumnProps<TableItem>> = [
  {
    dataIndex: 'name',
    key: 'name',
    render: renderName,
    title: renderColumnNameHeader,
    className: s.columnName,
  },
  {
    dataIndex: 'address',
    key: 'priceGraph',
    render: renderChart,
    title: 'Price Graph (7d)',
    className: s.columnChart,
  },
  {
    dataIndex: 'percentChange24H',
    key: 'change',
    render: renderChange,
    title: 'Change (24h)',
    className: s.columnChange,
  },
  {
    dataIndex: 'price',
    key: 'price',
    render: renderPrice,
    title: 'Price',
    className: s.columnPrice,
  },
  {
    align: 'right',
    key: 'actions',
    render: renderActions,
    title: '',
    className: s.columnActions,
  },
];

interface MultiTokenItem extends MultiToken {
  key: string | number;
}

interface MultiCoinItem extends MultiCoinShort {
  key: string | number;
}

type TableItem = MultiTokenItem | MultiCoinItem;

interface Props {
  isLoading: boolean;
  dataSource: Array<MultiToken | MultiCoinShort>;
}

@observer
class MTList extends Component<Props, {}> {
  // static defaultProps: Partial<Props> = {
  //   isLoading: false,
  // };

  render() {
    const dataSource: TableItem[] = this.props.dataSource.map((multiToken) => {
      return {
        ...multiToken,
        key: multiToken.uid,
      }
    });

    return (
      <div className={s.container}>
        <Table
          className={s.table}
          dataSource={dataSource}
          columns={columns}
          rowClassName={s.row}
          pagination={false}
          loading={{
            spinning: this.props.isLoading,
            delay: 1000,
            tip: 'Loading...',
          }}
        />
      </div>
    )
  }
}

export default MTList;
