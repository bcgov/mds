/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
import React, { Component } from 'react';
import { STATIC_MAP } from '@/constants/assets';
import PropTypes from 'prop-types';

const propTypes = {
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};

class MineHeader extends Component {
  render() {
    return (
      <div>
        <img className="mine__dashboard__header__img" src={STATIC_MAP} />
        <h1>{this.props.mine.mine_detail[0].mine_name} - Major Mine</h1>
        <h2>Mine #: {this.props.mine.mine_detail[0].mine_no} </h2>
      </div>
    );
  }
}

MineHeader.propTypes = propTypes;
MineHeader.defaultProps = defaultProps;

export default MineHeader;