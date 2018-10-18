import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LoadingBar from 'react-redux-loading-bar'
import { Modal, Card, Button } from 'antd';
import ConditionalButton from '@/components/common/ConditionalButton';
import AddPartyForm from '@/components/Forms/AddPartyForm';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import NullScreen from '@/components/common/NullScreen';
import * as router from '@/constants/routes';
import * as String from '@/constants/strings';

/**
 * @class ViewMineManager - all information of mine managers located under MineContactInfo.js
 */
const propTypes = {
  toggleModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  modalVisible: PropTypes.bool,
  mine: PropTypes.object.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
};

const defaultProps = {
  mine: {},
  parties: {},
  partyIds: []
};
 
export class ViewMineManager extends Component {
 handleSubmit = (values) => {
  this.props.handlePartySubmit(values, 'PER')
 }

  render() {
    const { mine } = this.props;
      return (
        <div>
          <Modal
              title="Update Mine Manager"
              visible={this.props.modalVisible}
              footer={null}
              onCancel={this.props.toggleModal}
            >
              <LoadingBar 
                scope="modal" 
                style={{ position: 'absolute', top: '50px', left: 0, backgroundColor: '#B9ADA2', width: '100%', height: '8px', zIndex: 100 }} 
              />
              <div>
                <UpdateMineManagerForm
                  onSubmit={this.props.handleSubmit}
                  parties={this.props.parties}
                  partyIds={this.props.partyIds}
                  handleChange={this.props.handleChange}
                />
                <p className="center">{String.PERSON_NOT_FOUND}</p>
                <AddPartyForm onSubmit={this.handleSubmit} isPerson/>
              </div>
            </Modal>
        {!mine.mgr_appointment[0] &&
            <Card>
              <NullScreen 
                type='manager'
                />
              <div className="center">
                <ConditionalButton 
                  handleAction={this.props.toggleModal} 
                  string="Add Mine Manager"
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
                    <td data-label="Mine Manager"><p className="p-large">{mine.mgr_appointment[0].name}</p></td>
                    <td data-label="Manager Since"><p className="p-large">{mine.mgr_appointment[0].effective_date}</p></td>
                  </tr>
                  <tr>
                    <th scope="col"><h4>Email</h4></th>
                    <th scope="col"><h4>Phone Number (Ext)</h4></th>
                  </tr>
                  <tr>
                    <td data-label="Email"><p className="p-large">{mine.mgr_appointment[0].email}</p></td>
                    <td data-label="Phone Number (Ext)"><p className="p-large">{mine.mgr_appointment[0].phone_no} ({mine.mgr_appointment[0].phone_ext ? mine.mgr_appointment[0].phone_ext : 'N/A'})</p></td>
                  </tr>
                </tbody>
              </table>
              <div className="right center-mobile">
                <Link to={router.PARTY_PROFILE.dynamicRoute(mine.mgr_appointment[0].party_guid)}>
                  <Button className="full-mobile" type="secondary">View profile</Button>
                </Link> 
                <ConditionalButton 
                  handleAction={this.props.toggleModal} 
                  string="Update Mine Manager" 
                  type="primary"
                />
              </div> 
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