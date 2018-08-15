
/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard (including all Mine Manager information);
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Drawer, Form, Button, Col, Row, Select, Input } from 'antd';
import UpdateMineManager from '@/components/mine/UpdateMineManager';

const propTypes = {
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};


class MineContactInfo extends Component {
  state = { visible: false };

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  render() {
    return (
      <div>
        <Button type="primary" onClick={this.showDrawer}>
          Update
        </Button>
        <Drawer
          title="Update Mine Manager"
          width={720}
          placement="right"
          onClose={this.onClose}
          maskClosable={false}
          visible={this.state.visible}
          style={{
            height: 'calc(100% - 55px)',
            overflow: 'auto',
            paddingBottom: 53,
          }}
        >
         <UpdateMineManager {...this.props}/>
        </Drawer>
      </div>
    );
  }
}

MineContactInfo.propTypes = propTypes;
MineContactInfo.defaultProps = defaultProps;

export default MineContactInfo;