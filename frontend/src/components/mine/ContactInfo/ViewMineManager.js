import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Button } from 'antd';
import ConditionalButton from '@/components/common/ConditionalButton';
import NullScreen from '@/components/common/NullScreen';
import * as router from '@/constants/routes';
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
 /**
   * change mine manager on record.
   */
  handleManagerSubmit = (values) => {
    this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
      this.props.fetchMineRecordById(this.props.mine.guid);
      this.props.closeModal();
    })
  }

 openModal(event, onSubmit, handleChange, handlePartySubmit, title) {
  event.preventDefault();
  this.props.openModal({
    props: { onSubmit, handleChange, handlePartySubmit, title},
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
                  handleAction={(event) => this.openModal(event, this.handleManagerSubmit, this.props.handleChange, this.handleSubmit, 'Add Mine Manager')} 
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
                  handleAction={(event) => this.openModal(event, this.handleManagerSubmit, this.props.handleChange, this.handleSubmit, 'Update Mine Manager')} 
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