// import React, { Component } from 'react';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
// import LoadingBar from 'react-redux-loading-bar'
// import { Modal, Card, Radio } from 'antd';
// import { createParty, fetchParties, addMineManager, fetchPartyById } from '@/actionCreators/partiesActionCreator';
// import { getMineRecordById } from '@/actionCreators/mineActionCreator';
// import { getParties, getPartyIds } from '@/selectors/partiesSelectors';
// import ConditionalButton from '@/components/common/ConditionalButton';
// import AddPermitteeForm from '@/components/Forms/AddPermitteeForm';
// import AddPartyForm from '@/components/Forms/AddPartyForm';
// import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
// import * as String from '@/constants/strings';

// const propTypes = {
//   fetchPartyById: PropTypes.func.isRequired,
//   fetchParties: PropTypes.func.isRequired,
//   createParty: PropTypes.func.isRequired,
//   addMineManager: PropTypes.func.isRequired,
//   getMineRecordById: PropTypes.func.isRequired,
//   mine: PropTypes.object.isRequired,
//   parties: PropTypes.object.isRequired,
//   partyIds: PropTypes.array.isRequired
// };

// const defaultProps = {
//   mine: {},
//   parties: {},
//   partyIds: []
// };

// export class ViewPermittee extends Component {
//   state = { modalVisible: false, isPerson: true }

//   /**
//  * add new parties (firstName, surname) OR compnay (companyName) to db.
//  */
//   handleSubmit = (values) => {
//     this.props.createParty({type: this.state.isPerson ? 'per' : 'org', ...values}).then(() => {
//       this.props.fetchParties();
//     });
//   }

//   /**
//    * change permittee on record.
//    */
//   handlePermitteeUpdate = (values) => {
//     console.log({type: this.state.isPerson ? 'per' : 'org', ...values});
//     // this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
//     //   this.setState({ modalVisible: !this.state.modalVisible });
//     //   this.props.getMineRecordById(this.props.mine.guid);
//     // })
//   }

//   // temporary check - in the future this table will be seeded with data
//   renderCorrectForm() {
//     return (
//       <div>
//         <AddPartyForm onSubmit={this.handleSubmit} isPerson={this.state.isPerson}/>
//       </div>
//     )
//   }

//   toggleModal = () => {
//     this.setState({
//       modalVisible: !this.state.modalVisible,
//     });
//   }

//   handleChange = (value) => {
//    this.setState({isPerson: value.target.value})
//   }

//   handleSearch = (value) => {
//     const type = this.state.isPerson ? 'per' : 'org';
//     if (value.length > 2){
//       this.props.fetchParties(type, value);
//     }
//     else if (value.length === 0) {
//       this.props.fetchParties(type);
//     }
//   }

//   componentDidMount() {
//     const type = this.state.isPerson ? 'per' : 'org';
//     this.props.fetchParties(type);
//     if (this.props.mine.mgr_appointment[0]) {
//       this.props.fetchPartyById(this.props.mine.mgr_appointment[0].person_guid);
//     }
//   }

//   render() {
//     const { mine } = this.props;
//       return (
//         <div>
//           <Card>
//             <table>
//               <tbody>
//                 <tr>
//                   <th scope="col"><h4>Permittee</h4></th>
//                   <th scope="col"><h4>Permittee Since</h4></th>
//                 </tr>
//                 <tr>
//                   <td data-label="Permittee"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></td>
//                   <td data-label="Permittee Since"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></td>
//                 </tr>
//               </tbody>
//             </table>
//             <div className="right center-mobile">
//               <ConditionalButton 
//                 handleAction={this.toggleModal} 
//                 string="Update Permittee" 
//                 type="primary"
//               />
//             </div> 
//           </Card>
//           <Modal
//             title="Update Permittee"
//             visible={this.state.modalVisible}
//             footer={null}
//             onCancel={this.toggleModal}
//           >
//             <LoadingBar 
//               scope="modal" 
//               style={{ position: 'absolute', top: '50px', left: 0, backgroundColor: '#B9ADA2', width: '100%', height: '8px', zIndex: 100 }} 
//             />
//             <div>
//               <div className="center">
//                 <Radio.Group defaultValue={true} size="large" onChange={this.handleChange}>
//                   <Radio.Button value={true}>Person</Radio.Button>
//                   <Radio.Button value={false}>Company</Radio.Button>
//                 </Radio.Group>
//               </div>
//               <UpdateMineManagerForm
//                 onSubmit={this.handlePermitteeUpdate}
//                 parties={this.props.parties}
//                 partyIds={this.props.partyIds}
//                 handleChange={this.handleSearch}
//                 isPerson={this.state.isPerson}
//                 id="permittee"
//                 label="Permittee"
//                 action={String.UPDATE_PERMITTEE}
//             />
//               <p className="center">{String.PARTY_NOT_FOUND}</p>
//               {this.renderCorrectForm()}
//             </div>
//           </Modal>
//         </div>
//       );
//     } 
//   }

// ViewPermittee.propTypes = propTypes;
// ViewPermittee.defaultProps = defaultProps;

// const mapStateToProps = (state) => {
//   return {
//     parties: getParties(state),
//     partyIds: getPartyIds(state),
//   };
// };

// const mapDispatchToProps = (dispatch) => {
//   return bindActionCreators({
//     fetchPartyById,
//     fetchParties,
//     createParty,
//     addMineManager,
//     getMineRecordById,
//   }, dispatch);
// }

// export default connect(mapStateToProps, mapDispatchToProps)(ViewPermittee);