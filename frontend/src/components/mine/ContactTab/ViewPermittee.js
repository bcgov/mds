import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LoadingBar from 'react-redux-loading-bar'
import { Modal, Card, Radio, Divider } from 'antd';
import ConditionalButton from '@/components/common/ConditionalButton';
import AddPartyForm from '@/components/Forms/AddPartyForm';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import * as String from '@/constants/strings';

const propTypes = {
  toggleModal: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  togglePartyChange: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  permitteeModalVisable: PropTypes.bool,
  isPerson: PropTypes.bool,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
  permittees: PropTypes.object,
  permitteeIds: PropTypes.array
};

const defaultProps = {
  mine: {},
  permittees: {},
  permitteeIds: [],
};

export class ViewPermittee extends Component {

  handleSubmit = (values) => {
    const type = this.props.isPerson ? 'PER' : 'ORG';
    this.props.handlePartySubmit(values, type);
  }
  
  render() {
    const { permittees, permitteeIds } = this.props;
      return (
        <div>
          <Card>
            <table>
              {permitteeIds.map((id) => {
              return (
                  <tbody key={id}>
                    <tr>
                      <th scope="col"><h4>Permittee</h4></th>
                      <th scope="col"><h4>Permittee Since</h4></th>
                    </tr>
                    <tr key={id}>
                      <td key={id} data-label="Permittee"><p className="p-large">{permittees[id].party.name}</p></td>
                      <td key={id} data-label="Permittee Since"><p className="p-large">{permittees[id].party.effective_date}</p></td>
                    </tr>
                    <tr>
                      <th scope="col"><h4>Email</h4></th>
                      <th scope="col"><h4>Phone Number (Ext)</h4></th>
                    </tr>
                    <tr>
                      <td data-label="Email"><p className="p-large">{permittees[id].party.email}</p></td>
                      <td data-label="Phone Number (Ext)"><p className="p-large">{permittees[id].party.phone_no} ({permittees[id].party.phone_ext ? permittees[id].party.phone_ext : 'N/A'})</p></td>
                    </tr>
                  </tbody>
                  )
                })}
              </table>
            <div className="right center-mobile">
              {/* <ConditionalButton 
                handleAction={this.props.toggleModal} 
                string="Update Permittee" 
                type="primary"
              /> */}
            </div> 
          </Card>
          <Modal
            title="Update Permittee"
            visible={this.props.permitteeModalVisable}
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
                handleChange={this.handleChange}
                isPerson={this.props.isPerson}
                id="permittee"
                label="Permittee"
                action={String.UPDATE_PERMITTEE}
            />
              <p className="center">{String.PARTY_NOT_FOUND}</p>
              <div className="center">
                <Radio.Group defaultValue={true} size="large" onChange={this.props.togglePartyChange}>
                  <Radio.Button value={true}>Person</Radio.Button>
                  <Radio.Button value={false}>Company</Radio.Button>
                </Radio.Group>
              </div>
              <AddPartyForm onSubmit={this.handleSubmit} isPerson={this.props.isPerson}/>
            </div>
          </Modal>
        </div>
      );
    } 
  }

ViewPermittee.propTypes = propTypes;
ViewPermittee.defaultProps = defaultProps;

export default ViewPermittee;