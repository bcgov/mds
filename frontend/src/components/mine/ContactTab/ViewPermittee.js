import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LoadingBar from 'react-redux-loading-bar'
import { Modal, Card, Radio } from 'antd';
import ConditionalButton from '@/components/common/ConditionalButton';
import AddPartyForm from '@/components/Forms/AddPartyForm';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import * as String from '@/constants/strings';

const propTypes = {
  toggleModal: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  permitteeModalVisable: PropTypes.bool,
  isPerson: PropTypes.bool,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired
};

const defaultProps = {
  mine: {},
  parties: {},
  partyIds: []
};

export class ViewPermittee extends Component {
  render() {
    const { mine } = this.props;
      return (
        <div>
          <Card>
            <table>
              <tbody>
                <tr>
                  <th scope="col"><h4>Permittee</h4></th>
                  <th scope="col"><h4>Permittee Since</h4></th>
                </tr>
                <tr>
                  <td data-label="Permittee"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></td>
                  <td data-label="Permittee Since"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></td>
                </tr>
              </tbody>
            </table>
            <div className="right center-mobile">
              <ConditionalButton 
                handleAction={this.props.toggleModal} 
                string="Update Permittee" 
                type="primary"
              />
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
              <div className="center">
                <Radio.Group defaultValue={true} size="large" onChange={this.props.togglePartyChange}>
                  <Radio.Button value={true}>Person</Radio.Button>
                  <Radio.Button value={false}>Company</Radio.Button>
                </Radio.Group>
              </div>
              <UpdateMineManagerForm
                onSubmit={this.props.handleSubmit}
                parties={this.props.parties}
                partyIds={this.props.partyIds}
                handleChange={this.props.handleChange}
                isPerson={this.props.isPerson}
                id="permittee"
                label="Permittee"
                action={String.UPDATE_PERMITTEE}
            />
              <p className="center">{String.PARTY_NOT_FOUND}</p>
              <AddPartyForm onSubmit={this.props.handlePartySubmit} isPerson={this.props.isPerson}/>
            </div>
          </Modal>
        </div>
      );
    } 
  }

ViewPermittee.propTypes = propTypes;
ViewPermittee.defaultProps = defaultProps;

export default ViewPermittee;