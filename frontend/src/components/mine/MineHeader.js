import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import MineMap from '@/components/maps/MineMap';
import { ELLIPSE, SMALL_PIN, PENCIL, RED_ELLIPSE } from '@/constants/assets';
import MineRecordForm from '@/components/Forms/MineRecordForm';
import ConditionalButton from '@/components/common/ConditionalButton';

/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
const propTypes = {
  mine: PropTypes.object.isRequired,
  handleMineUpdate: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func,
  fetchMineRecordById: PropTypes.func,
  mineStatusOptions: PropTypes.array
};

const defaultProps = {
  mine: {}
};

class MineHeader extends Component {
  state = { visible: false }
  
  handleUpdateMineRecord = (value) => {
    this.props.updateMineRecord(this.props.mine.guid, value, value.name).then(() =>{
      this.props.fetchMineRecordById(this.props.mine.guid);
      this.setState({
        visible: false,
      });
    })
  }
  
  toggleModal = () => {
    this.setState({
      visible: !this.state.visible,
    });
  }

  renderInitialValues = (mine) => {
    // initialValues is built into redux forms, simply pass in the prop 'initialValues' with the correct field names and redux forms will do the rest. 
    const initialValues = {
      "name": mine.mine_detail[0] ? mine.mine_detail[0].mine_name : null,
      "latitude": mine.mine_location[0] ? mine.mine_location[0].latitude : null,
      "longitude": mine.mine_location[0] ? mine.mine_location[0].longitude : null,
      "mine_status": mine.mine_status ? mine.mine_status[0].status_value : null,
    }
    return (
      <MineRecordForm onSubmit={this.handleUpdateMineRecord} initialValues={initialValues} title="Update Mine Record" mineStatusOptions={this.props.mineStatusOptions}/>
    )
  }
  
  render() {
    const { mine } = this.props;
    return (
      <div className="dashboard__header">
        <MineMap mine={mine}/>
        <div className="dashboard__header__content">
          <div className="inline-flex between">
            <h1>{mine.mine_detail[0].mine_name}</h1>
            <ConditionalButton 
              type="primary" 
              handleAction={this.toggleModal}
              string={<img style={{padding: '5px'}}src={PENCIL} />}
            />
          </div>
          <h5>Mine ID: {mine.mine_detail[0].mine_no} </h5>
          <Modal
            title="Update Mine Record"
            visible={this.state.visible}
            onCancel={this.toggleModal}
            footer={null}
          >
            {this.renderInitialValues(mine)}
          </Modal>
          <div className="dashboard__header__content--inline">
            <div className="inline-flex between">
              <img className="inline-flex--img" src={SMALL_PIN} />
              <div><p>Lat:{mine.mine_location[0] ? mine.mine_location[0].latitude : 'N/A'}</p></div>
              <div><p>Long:{mine.mine_location[0] ? mine.mine_location[0].longitude : 'N/A'}</p></div>
            </div>
            {mine.mine_status && 
              <div className="inline-flex between">
                <img src={(mine.mine_status && (mine.mine_status[0].mine_operation_status === 'OP' )) ? ELLIPSE : RED_ELLIPSE} />
                <div><h5>Status: </h5></div>
                <div>
                  <h3>
                      {mine.mine_status[0].status_label.map((label, i) => {
                      return (<span key={i}>{label} /</span>)
                    })}
                  </h3>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

MineHeader.propTypes = propTypes;
MineHeader.defaultProps = defaultProps;

export default MineHeader;