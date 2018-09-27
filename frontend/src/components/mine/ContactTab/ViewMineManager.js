import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LoadingBar from 'react-redux-loading-bar'
import { Modal, Card, Button } from 'antd';
import { createParty, fetchParties, addMineManager, fetchPartyById } from '@/actionCreators/partiesActionCreator';
import { getMineRecordById } from '@/actionCreators/mineActionCreator';
import { getParties, getPartyIds } from '@/selectors/partiesSelectors';
import ConditionalButton from '@/components/common/ConditionalButton';
import Loading from '@/components/common/Loading';
import AddPartyForm from '@/components/Forms/AddPartyForm';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import NullScreen from '@/components/common/NullScreen';
import * as router from '@/constants/routes';

const propTypes = {
  fetchPartyById: PropTypes.func.isRequired,
  fetchParties: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  addMineManager: PropTypes.func.isRequired,
  getMineRecordById: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired
};

const defaultProps = {
  mine: {},
  parties: {},
  partyIds: []
};

export class ViewMineManager extends Component {
  state = { modalVisible: false }
  /**
 * add new parties (firstName, surname) to db.
 */
  handlePartySubmit = (values) => {
    this.props.createParty(values).then(() => {
      this.props.fetchParties();
    });
  }

  /**
   * change mine manager on record.
   */
  handleSubmit = (values) => {
    this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
      this.setState({ modalVisible: !this.state.modalVisible });
      this.props.getMineRecordById(this.props.mine.guid);
    })
  }


  handleChange = (value) => {
    if (value.length > 2){
      this.props.fetchParties(value);
    }
    else if (value.length === 0) {
      this.props.fetchParties();
    }
  }

  // temporary check - in the future this table will be seeded with data
  renderMineManagerForm() {
    if (this.props.partyIds.length === 0) {
      return (<NullScreen type="manager" small/>)
    } else {
      return (
        <div>
          <UpdateMineManagerForm
            onSubmit={this.handleSubmit}
            parties={this.props.parties}
            partyIds={this.props.partyIds}
            handleChange={this.handleChange}
          />
          <p className="center">Didn't find what you're looking for? Please add a new party below</p>
        </div>
      )
    }
  }

  toggleModal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  }

  componentDidMount() {
    this.props.fetchParties();
    if (this.props.mine.mgr_appointment[0]) {
      this.props.fetchPartyById(this.props.mine.mgr_appointment[0].person_guid);
    }
  }

  render() {
    const { mine } = this.props;
    if (this.props.mine.mgr_appointment[0] && this.props.partyIds[0]) {
      const parties = this.props.parties[mine.mgr_appointment[0].person_guid];
      return (
        <div>
          <Card>
            <table>
              <tbody>
                <tr>
                  <th scope="col"><h4>Mine Manager</h4></th>
                  <th scope="col"><h4>Manager Since</h4></th>
                </tr>
                <tr>
                  <td data-label="Mine Manager"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></td>
                  <td data-label="Manager Since"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></td>
                </tr>
                <tr>
                  <th scope="col"><h4>Email</h4></th>
                  <th scope="col"><h4>Phone Number (Ext)</h4></th>
                </tr>
                <tr>
                  <td data-label="Email"><p className="p-large">{parties.email}</p></td>
                  <td data-label="Phone Number (Ext)"><p className="p-large">{parties.phone_no} ({parties.phone_ext ? parties.phone_ext : 'N/A'})</p></td>
                </tr>
              </tbody>
            </table>
            <div className="right center-mobile">
              <Link to={router.PARTY_PROFILE.dynamicRoute(mine.mgr_appointment[0].person_guid)}>
                <Button className="full-mobile" type="secondary">View profile</Button>
              </Link> 
              <ConditionalButton 
                handleAction={this.toggleModal} 
                string="Update Mine Manager" 
                type="primary"
              />
            </div> 
          </Card>
          <Modal
            title="Update Mine Manager"
            visible={this.state.modalVisible}
            footer={null}
            onCancel={this.toggleModal}
          >
            <LoadingBar 
              scope="modal" 
              style={{ position: 'absolute', top: '50px', left: 0, backgroundColor: '#B9ADA2', width: '100%', height: '8px', zIndex: 100 }} 
            />
            <div>
              {this.renderMineManagerForm()}
              <AddPartyForm onSubmit={this.handlePartySubmit} />
            </div>
          </Modal>
        </div>
      );
    } else if (!this.props.mine.mgr_appointment[0]) {
      return (
        <div>
          <NullScreen 
            type='manager'
          />
          <div className="center">
            <ConditionalButton 
              handleAction={this.toggleModal} 
              string="Add Mine Manager"
              type="primary"
             />
          </div>
          <Modal
            title="Add Mine Manager"
            visible={this.state.modalVisible}
            footer={null}
            onCancel={this.toggleModal}
          >
            <div>
              {this.renderMineManagerForm()}
              <AddPartyForm onSubmit={this.handlePartySubmit} />
            </div>
          </Modal>
        </div>
      )
    } else {
      return <Loading />
    }
  }
}

ViewMineManager.propTypes = propTypes;
ViewMineManager.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  return {
    parties: getParties(state),
    partyIds: getPartyIds(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchPartyById,
    fetchParties,
    createParty,
    addMineManager,
    getMineRecordById,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewMineManager);