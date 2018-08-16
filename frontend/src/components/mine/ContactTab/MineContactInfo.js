
/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard (including all Mine Manager information);
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Drawer, Form, Button, Col, Row, Select, Input } from 'antd';
import UpdateMineManager from './UpdateMineManager';

const propTypes = {
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};


class MineContactInfo extends Component {
  render() {
    return (
      <div>
         <UpdateMineManager {...this.props}/>
      </div>
    );
  }
}

MineContactInfo.propTypes = propTypes;
MineContactInfo.defaultProps = defaultProps;

export default MineContactInfo;