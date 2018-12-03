import { Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import {
  Link,
} from 'react-router-dom';
// @ts-ignore
import { Sparklines, SparklinesCurve } from 'react-sparklines';

import { WalletMultiTokenExtra } from '../../../../services/wallet.service';
import { formatNumberShort, formatPercent } from '../../../../utils/format';
import MTBuyButton from '../MTBuyButton/MTBuyButton';
import MTSellButton from '../MTSellButton/MTSellButton';

import s from './MTMyList.pcss';
import multiTokenDefaultSvg from './multitoken-default.svg';


function renderColumnNameHeader() {
  return (
    <div className={s.columnNameHeader}>
      Name
    </div>
  );
}

function renderName(name: string, record: TableItem, index: number) {
  return (
    <Link
      className={`${s.cell} ${s.token}`}
      to={`multitokens/${record.multiToken.address}`}
      title={name}
    >
      <div className={s.tokenPosition}>{index + 1}</div>
      <img className={s.tokenImg} alt="icon" src={record.multiToken.icon || multiTokenDefaultSvg} />
      <div className={s.tokenNameAndTicker}>
        <div className={s.tokenName}>{name}</div>
        <div className={s.tokenTicker}>{record.multiToken.symbol}</div>
      </div>
    </Link>
  );
}

function renderAmount(value: string, record: TableItem, index: number) {
  return (
    <Link
      className={`${s.cell} ${s.amount}`}
      to={`multitokens/${record.multiToken.address}`}
    >
      {formatNumberShort(value, 'm')}
    </Link>
  );
}

function renderProfit(text: string, record: TableItem, index: number) {
  const profitString = formatNumberShort(text, 'k');
  const profitValue = parseFloat(profitString);

  return (
    <Link
      className={`${s.cell} ${s.profit}`}
      to={`multitokens/${record.multiToken.address}`}
    >
      {profitValue >= 0
        ? <span>$&#8288;{profitString}</span>
        : <span>−&#8288;$&#8288;{profitString.slice(1)}</span>
      }
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

function renderChange(change: number, record: TableItem, index: number) {
  return (
    <Link
      className={`${s.cell} ${s.changeLink}`}
      to={`multitokens/${record.multiToken.address}`}
    >
      {getChangeElement(change)}
    </Link>
  );
}

function renderPrice(value: string, record: TableItem, index: number) {
  return (
    <Link
      className={`${s.cell} ${s.price}`}
      to={`multitokens/${record.multiToken.address}`}
    >
      <div>
        <div>${formatNumberShort(value)}</div>
        {getChangeElement(parseFloat(record.multiToken.percentChange24H))}
      </div>
    </Link>
  );
}

function renderActions(text: any, record: TableItem, index: number) {
  return (
    <div className={`${s.cell} ${s.actions}`}>
      <MTBuyButton
        multiToken={record.multiToken}
      />
      <MTSellButton
        address={record.multiToken.address}
        symbol={record.multiToken.symbol}
      />
    </div>
  )
}

interface TableItem extends WalletMultiTokenExtra {
  key: string | number;
}

const columns: Array<ColumnProps<TableItem>> = [
  {
    dataIndex: 'multiToken.name',
    key: 'name',
    render: renderName,
    title: renderColumnNameHeader,
    className: s.columnName,
  },
  {
    dataIndex: 'amount',
    key: 'amount',
    render: renderAmount,
    title: 'Purchase',
    className: s.columnAmount,
  },
  {
    dataIndex: 'profitUsd',
    key: 'profitUsd',
    render: renderProfit,
    title: 'Profit',
    className: s.columnProfit,
  },
  {
    dataIndex: 'multiToken.percentChange24H',
    key: 'change',
    render: renderChange,
    title: 'Change (24h)',
    className: s.columnChange,
  },
  {
    dataIndex: 'multiToken.price',
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

interface Props {
  dataSource: WalletMultiTokenExtra[];
  isLoading?: boolean;
}

@observer
class MTMyList extends Component<Props, {}> {
  render() {
    const dataSource: TableItem[] = this.props.dataSource.map((multiToken) => {
      return {
        ...multiToken,
        key: multiToken.multiToken.uid,
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
            spinning: this.props.isLoading || false,
            delay: 1000,
            tip: 'Loading...',
          }}
          locale={{
            emptyText: 'No tokens yet.',
          }}
        />
      </div>
    )
  }
}

export default MTMyList;
