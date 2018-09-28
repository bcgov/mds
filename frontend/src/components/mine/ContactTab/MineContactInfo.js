
/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard (including all Mine Manager information);
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import ViewMineManager from './ViewMineManager';
import ViewPermittee from './ViewPermittee';
import { Link } from 'react-router-dom';
import LoadingBar from 'react-redux-loading-bar'
import { createParty, fetchParties, addMineManager, fetchPartyById } from '@/actionCreators/partiesActionCreator';
import { getMineRecordById } from '@/actionCreators/mineActionCreator';
import { getParties, getPartyIds } from '@/selectors/partiesSelectors';
import { Modal, Card, Button, Radio } from 'antd';
import ConditionalButton from '@/components/common/ConditionalButton';
import Loading from '@/components/common/Loading';
import AddPartyForm from '@/components/Forms/AddPartyForm';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import NullScreen from '@/components/common/NullScreen';
import * as router from '@/constants/routes';
import * as String from '@/constants/strings';


const propTypes = {
  mine: PropTypes.object.isRequired,
  fetchPartyById: PropTypes.func.isRequired,
  fetchParties: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  addMineManager: PropTypes.func.isRequired,
  getMineRecordById: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired
};

const defaultProps = {
  mine: {},
  parties: {},
  partyIds: []
};


export class MineContactInfo extends Component {
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
    this.setState({isPerson: value.target.value})
   }

  handleSearch = (value) => {
    const type = this.state.isPerson ? 'per' : 'org';
    if (value.length > 2){
      this.props.fetchParties(type, value);
    }
    else if (value.length === 0) {
      this.props.fetchParties(type);
    }
  }

    // // temporary check - in the future this table will be seeded with data
    // renderCorrectForm() {
    //   return (
    //     <div>
    //       <AddPartyForm onSubmit={this.handleSubmit} isPerson={this.state.isPerson}/>
    //     </div>
    //   )
    // }
  // temporary check - in the future this table will be seeded with data
  renderMineManagerForm() {
    if (this.props.partyIds.length === 0) {
      return (<NullScreen type="manager"/>)
    } else {
      return (
        <div>
          <UpdateMineManagerForm
            onSubmit={this.handleSubmit}
            parties={this.props.parties}
            partyIds={this.props.partyIds}
            handleChange={this.handleSearch}
            id="mineManager"
            label="Mine Manager"
            action={String.UPDATE_MINE_MANAGER}
          />
          <p className="center">{String.PARTY_NOT_FOUND}</p>
        </div>
      )
    }
  }

  renderPermittee() {
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
                handleAction={this.toggleModal} 
                string="Update Permittee" 
                type="primary"
              />
            </div> 
          </Card>
          <Modal
            title="Update Permittee"
            visible={this.state.modalVisible}
            footer={null}
            onCancel={this.toggleModal}
          >
        <LoadingBar 
          scope="modal" 
          style={{ position: 'absolute', top: '50px', left: 0, backgroundColor: '#B9ADA2', width: '100%', height: '8px', zIndex: 100 }} 
        />
        <div>
          <div className="center">
            <Radio.Group defaultValue={true} size="large" onChange={this.handleChange}>
              <Radio.Button value={true}>Person</Radio.Button>
              <Radio.Button value={false}>Company</Radio.Button>
            </Radio.Group>
          </div>
          <UpdateMineManagerForm
            onSubmit={this.handlePermitteeUpdate}
            parties={this.props.parties}
            partyIds={this.props.partyIds}
            handleChange={this.handleSearch}
            isPerson={this.state.isPerson}
            id='permittee'
            label='Permittee'
            action={String.UPDATE_PERMITTEE}
          />
          <p className="center">{String.PARTY_NOT_FOUND}</p>
          <AddPartyForm onSubmit={this.handleSubmit} isPerson={this.state.isPerson}/>
        </div>
      </Modal>
          {/* {this.renderCorrectModal('permittee')} */}
        </div>
    )
  }

  toggleModal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  }

  handlePermitteeUpdate = (values) => {
    console.log({type: this.state.isPerson ? 'per' : 'org', ...values});
    // this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
    //   this.setState({ modalVisible: !this.state.modalVisible });
    //   this.props.getMineRecordById(this.props.mine.guid);
    // })
  }

  componentDidMount() {
    const type = this.state.isPerson ? 'per' : 'org';
    this.props.fetchParties(type);
    if (this.props.mine.mgr_appointment[0]) {
      this.props.fetchPartyById(this.props.mine.mgr_appointment[0].person_guid);
    }
  }

// renderMineManager() {
//   const { mine } = this.props;
//   const manager = this.props.mine.mgr_appointment[0];
//   const permittee = this.props.mine.permittee;
//   const party = this.props.parties[mine.mgr_appointment[0].person_guid];
//   return (
    // <div>
    //   <Card>
    //     <table>
    //       <tbody>
    //         <tr>
    //           <th scope="col"><h4>Mine Manager</h4></th>
    //           <th scope="col"><h4>Manager Since</h4></th>
    //         </tr>
    //         <tr>
    //           <td data-label="Mine Manager"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></td>
    //           <td data-label="Manager Since"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></td>
    //         </tr>
    //         <tr>
    //           <th scope="col"><h4>Email</h4></th>
    //           <th scope="col"><h4>Phone Number (Ext)</h4></th>
    //         </tr>
    //         <tr>
    //           <td data-label="Email"><p className="p-large">{party.email}</p></td>
    //           <td data-label="Phone Number (Ext)"><p className="p-large">{party.phone_no} ({party.phone_ext ? party.phone_ext : 'N/A'})</p></td>
    //         </tr>
    //       </tbody>
    //     </table>
    //     <div className="right center-mobile">
    //       <Link to={router.PARTY_PROFILE.dynamicRoute(mine.mgr_appointment[0].person_guid)}>
    //         <Button className="full-mobile" type="secondary">View profile</Button>
    //       </Link> 
    //       <ConditionalButton 
    //         handleAction={this.toggleModal(this.state)} 
    //         string="Update Mine Manager" 
    //         type="primary"
    //       />
    //     </div> 
    //   </Card>
    //   {this.renderCorrectModal('manager')}
    // </div>
//   );
// }

// renderNullScreen(type) {
//   return (
//       <Card>
//         <NullScreen 
//           type={type}
//         />
//         <div className="center">
//           <ConditionalButton 
//             handleAction={this.toggleModal} 
//             string="Add Mine Manager"
//             type="primary"
//            />
//         </div>
//         {this.renderCorrectModal()}
//       </Card>
//     )
// }
  render() {
    if (this.props.partyIds[0]) {
      return (
        <div>
          {/* {this.renderMineManager()} */}
          {this.renderPermittee()}
        </div>
      )
    } else {
      return <Loading />
    }
  }
}

MineContactInfo.propTypes = propTypes;
MineContactInfo.defaultProps = defaultProps;

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

export default connect(mapStateToProps, mapDispatchToProps)(MineContactInfo);