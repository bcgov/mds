/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Icon } from 'antd';
import MineMap from '@/components/maps/MineMap';
import { ELLIPSE } from '@/constants/assets';

const propTypes = {
  mine: PropTypes.object.isRequired
};

const defaultProps = {
  mine: {}
};

class MineHeader extends Component {
  render() {
    return (
      <div>
        <MineMap />
        <div className="dashboard__header__content">
          <h1>{this.props.mine.mine_detail[0].mine_name} - Major Mine</h1>
          <p>Mine #: {this.props.mine.mine_detail[0].mine_no} </p>
          <Row gutter={16}>
            <Col span={12}>
              <p>Lat: 48.474752</p>
              <p>Long: -123.657985</p>
            </Col>
            <Col span={12}>
              <p><Icon type="smile" style={{ color: '#47C744'}}/>Status Active </p>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

MineHeader.propTypes = propTypes;
MineHeader.defaultProps = defaultProps;

export default MineHeader;