import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'antd';
import MineMap from '@/components/maps/MineMap';
import { ELLIPSE, SMALL_PIN } from '@/constants/assets';
import AddMineRecordForm from '@/components/Forms/AddMineRecordForm';

/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
const propTypes = {
  mine: PropTypes.object.isRequired
};

const defaultProps = {
  mine: {}
};

class MineHeader extends Component {
  state = { visible: false }
  handleSubmit = (value) => {
      this.setState({
        visible: false,
      });
  }

  toggleModal = () => {
    this.setState({
      visible: !this.state.visible,
    });
  }
  render() {
    const { mine } = this.props;
    return (
      <div className="dashboard__header">
        <MineMap mine={mine}/>
        <div className="dashboard__header__content">
          <h1>{mine.mine_detail[0].mine_name}</h1>
          <div className="right">
          <Button className="full-mobile center-mobile" type="primary" size="large" onClick={this.toggleModal}>
              Update Mine Record
          </Button>
        </div>
          <h5>Mine ID: {mine.mine_detail[0].mine_no} </h5>
          <Modal
          title="Create Mine Record"
          visible={this.state.visible}
          onCancel={this.toggleModal}
          footer={null}
        >
          <AddMineRecordForm onSubmit={this.handleSubmit} />
        </Modal>
          <div className="dashboard__header__content--inline">
            <div className="inline-flex between">
              <img className="inline-flex--img" src={SMALL_PIN} />
              <div><p>Lat:{mine.mine_location[0] ? mine.mine_location[0].latitude : 'N/A'}</p></div>
              <div><p>Long:{mine.mine_location[0] ? mine.mine_location[0].longitude : 'N/A'}</p></div>
            </div>
            <div className="inline-flex between">
              <img src={ELLIPSE} />
              <div><h5>Status: </h5></div>
              <div><h3>Active</h3></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MineHeader.propTypes = propTypes;
MineHeader.defaultProps = defaultProps;

export default MineHeader;