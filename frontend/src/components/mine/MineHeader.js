import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MineMap from '@/components/maps/MineMap';
import { ELLIPSE, SMALL_PIN, PENCIL, RED_ELLIPSE } from '@/constants/assets';
import * as String from '@/constants/strings';
import * as ModalContent from '@/constants/modalContent';
import ConditionalButton from '@/components/common/ConditionalButton';
import { modalConfig } from '@/components/modalContent/config';

/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
const propTypes = {
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func,
  fetchMineRecordById: PropTypes.func,
  mineStatusOptions: PropTypes.array,
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {}
};

class MineHeader extends Component { 
  handleUpdateMineRecord = (value) => {
    let mineStatus = value.mine_status.join(",");
    this.props.updateMineRecord(this.props.mine.guid, {...value, mine_status: mineStatus}, value.name).then(() =>{
      this.props.closeModal();
      this.props.fetchMineRecordById(this.props.mine.guid);
    })
  }

  openModal(event, mineStatusOptions, onSubmit, title, mine) {
    event.preventDefault();
    const initialValues = {
      "name": mine.mine_detail[0] ? mine.mine_detail[0].mine_name : null,
      "latitude": mine.mine_location[0] ? mine.mine_location[0].latitude : null,
      "longitude": mine.mine_location[0] ? mine.mine_location[0].longitude : null,
      "mine_status": mine.mine_status[0] ? mine.mine_status[0].status_values : null,
    }
    this.props.openModal({
      props: { mineStatusOptions, onSubmit, title, initialValues},
      content: modalConfig.MINE_RECORD
    });
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
              handleAction={(event) => this.openModal(event, this.props.mineStatusOptions, this.handleUpdateMineRecord, ModalContent.UPDATE_MINE_RECORD, this.props.mine )}
              string={<img style={{padding: '5px'}}src={PENCIL} />}
            />
          </div>
          <h5>Mine ID: {mine.mine_detail[0].mine_no} </h5>
          <div className="dashboard__header__content--inline">
            <div className="inline-flex between">
              <img className="inline-flex--img" src={SMALL_PIN} />
              <div><p>Lat:{mine.mine_location[0] ? mine.mine_location[0].latitude : String.EMPTY_FIELD}</p></div>
              <div><p>Long:{mine.mine_location[0] ? mine.mine_location[0].longitude : String.EMPTY_FIELD}</p></div>
            </div>
            {mine.mine_status[0] && 
              <div className="inline-flex between">
                <div><h5>Operating Status: </h5></div>
                <img src={(mine.mine_status[0].status_values[0] === 'OP' ) ? ELLIPSE : RED_ELLIPSE} />
                <div>
                  <h3>
                      {mine.mine_status[0].status_labels.map((label, i) => {
                      return (<span className="mine__status" key={i}>{label} </span>)
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