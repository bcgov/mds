import React, { Component } from 'react';
import { STATIC_MAP } from '@/constants/assets';

class MineHeader extends Component {
  render() {
    return (
      <div>
        <img src={STATIC_MAP} />
        <h1>{this.props.mine.mine_detail[0].mine_name} - Major Mine</h1>
        <h2>Mine #: {this.props.mine.mine_detail[0].mine_no} </h2>
      </div>
    );
  }
}

export default MineHeader;