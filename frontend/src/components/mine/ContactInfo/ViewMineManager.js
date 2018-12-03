import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Button } from 'antd';
import ConditionalButton from '@/components/common/ConditionalButton';
import NullScreen from '@/components/common/NullScreen';
import * as router from '@/constants/routes';
import * as String from '@/constants/strings';
import * as ModalContent from '@/constants/modalContent';
import { modalConfig } from '@/components/modalContent/config';

/**
 * @class ViewMineManager - all information of mine managers located under MineContactInfo.js
 */
const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  addMineManager: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};
 
export class ViewMineManager extends Component {
  state = { isHistoryVisible: false, }

  handleSubmit = (values) => {
    this.props.handlePartySubmit(values, ModalContent.PERSON)
  }
  /**
   * change mine manager on record.
   */
  handleManagerSubmit = (values) => {
    this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
      this.props.fetchMineRecordById(this.props.mine.guid);
      this.props.closeModal();
    })
  }

  toggleMineManagerHistory = () => {
    this.setState({
      isHistoryVisible: !this.state.isHistoryVisible,
    })
  }

  openModal(event, onSubmit, handleChange, handlePartySubmit, title) {
    event.preventDefault();

    const appointment = this.props.mine.mgr_appointment;
    const hasAppointment = appointment != null && appointment.length > 0;
    const initialValues = {
      mineManager: hasAppointment ? appointment[0].party_guid : null,
      startDate: hasAppointment ? appointment[0].effective_date : null
    }

    this.props.openModal({
      props: { onSubmit, handleChange, handlePartySubmit, title, initialValues },
      content: modalConfig.UPDATE_MINE_MANAGER
    });
  }

  render() {
    const { mine } = this.props;
      return (
        <div>
        {!mine.mgr_appointment[0] &&
            <Card>
              <NullScreen 
                type='manager'
                />
              <div className="center">
                <ConditionalButton 
                  handleAction={(event) => this.openModal(event, this.handleManagerSubmit, this.props.handleChange, this.handleSubmit, ModalContent.ADD_MINE_MANAGER)} 
                  string={ModalContent.ADD_MINE_MANAGER}
                  type="primary"
                  />
              </div>
            </Card>
          }
        {mine.mgr_appointment[0] && 
          <div>
            <Card>
              <table>
                <tbody>
                  <tr>
                    <th scope="col"><h4>Mine Manager</h4></th>
                    <th scope="col"><h4>Manager Since</h4></th>
                  </tr>
                  <tr>
                    <td data-label="Mine Manager">
                      <Link to={router.PARTY_PROFILE.dynamicRoute(mine.mgr_appointment[0].party_guid)}>
                        <p className="p-large">{mine.mgr_appointment[0].name}</p>
                      </Link>
                    </td>
                    <td data-label="Manager Since"><p className="p-large">{mine.mgr_appointment[0].effective_date}</p></td>
                  </tr>
                  <tr>
                    <th scope="col"><h4>Email</h4></th>
                    <th scope="col"><h4>Phone Number (Ext)</h4></th>
                  </tr>
                  <tr>
                    <td data-label="Email"><p className="p-large">{mine.mgr_appointment[0].email}</p></td>
                    <td data-label="Phone Number (Ext)"><p className="p-large">{mine.mgr_appointment[0].phone_no} ({mine.mgr_appointment[0].phone_ext ? mine.mgr_appointment[0].phone_ext : String.EMPTY_FIELD})</p></td>
                  </tr>
                </tbody>
              </table>
              <div className="right center-mobile">        
                <Button className="full-mobile" type="secondary" onClick={this.toggleMineManagerHistory}>
                  {this.state.isHistoryVisible ? 'Close History' : 'View history'}
                </Button>
                <ConditionalButton 
                  handleAction={(event) => this.openModal(event, this.handleManagerSubmit, this.props.handleChange, this.handleSubmit, ModalContent.UPDATE_MINE_MANAGER)} 
                  string={ModalContent.UPDATE_MINE_MANAGER}
                  type="primary"
                />
              </div>
              {this.state.isHistoryVisible  &&
                <div className="table-wrapper">
                  { mine.mgr_appointment.length > 1 &&
                    <table>
                      <tr>
                        <th scope="col"><h2>Mine Manager History</h2></th>
                      </tr>
                      {mine.mgr_appointment.map((mgr, index) => {
                        if(index > 0){
                          return (
                            <tr key={mgr.mgr_appointment_guid}>
                              <td data-label="Name"><h5>{mgr.name}</h5></td>
                              {/* TODO: need to change this to handle the cert number once it is available in the state. */}
                              {/* <td><h5>&nbsp;</h5></td> */}
                              <td data-label="Date Issued"><h5>{mgr.effective_date} to {mgr.expiry_date}</h5></td>
                            </tr>
                          )
                        }
                      })}
                    </table>
                  }
                  {(mine.mgr_appointment.length <=1) &&
                    <NullScreen type='view-mine-manager' />
                  }
                </div>
              }
            </Card>
          </div>
        }
      </div>
    )
  }
}

ViewMineManager.propTypes = propTypes;
ViewMineManager.defaultProps = defaultProps;

export default ViewMineManager;