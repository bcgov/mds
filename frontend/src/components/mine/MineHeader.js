/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
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
    const { mine } = this.props;
    return (
      <div>
        <MineMap mine={mine}/>
        <div className="dashboard__header__content">
          <h1>{mine.mine_detail[0].mine_name}</h1>
          <p>Mine #: {mine.mine_detail[0].mine_no} </p>
          <Row gutter={16}>
            <Col span={12}>
              <p>Lat: {mine.mine_location[0] ? mine.mine_location[0].latitude : 'N/A'}</p>
              <p>Long:{mine.mine_location[0] ? mine.mine_location[0].longitude: 'N/A'}</p>
            </Col>
            <Col span={12}>
              <h4><img src={ELLIPSE} />Status: Active </h4>
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