
/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard (including all Mine Manager information);
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ViewMineManager from './ViewMineManager';
import ViewPermittee from './ViewPermittee';
import { createParty, fetchParties, addMineManager, fetchPartyById } from '@/actionCreators/partiesActionCreator';
import { getMineRecordById } from '@/actionCreators/mineActionCreator';
import { getParties, getPartyIds } from '@/selectors/partiesSelectors';

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
    state = { modalVisible: false, permitteeModalVisable: false, isPerson: true }
  /**
 * add new parties (firstName, surname) to db.
 */
  handlePartySubmit = (values) => {
    console.log(values);
    this.props.createParty(values).then(() => {
      this.props.fetchParties();
    });
  }
  /**
   * change mine manager on record.
   */
  handleManagerSubmit = (values) => {
    console.log(this.state.isPerson);
      this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
        this.setState({ modalVisible: !this.state.modalVisible });
        this.props.getMineRecordById(this.props.mine.guid);
      })
  }

  togglePartyChange = (value) => {
    this.setState({
      isPerson: value.target.value,
    });
  }

   handlePermitteeSubmit = (values) => {
    console.log(values);
  }


  handleChange = (value) => {
    if (value.length > 2){
      this.props.fetchParties(value);
    }
    else if (value.length === 0) {
      this.props.fetchParties();
    }
  }

  togglePermitteeModal = () => {
    this.setState({
      permitteeModalVisable: !this.state.permitteeModalVisable,
    });
  }

  toggleModal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  }

  componentDidMount() {
    this.props.fetchParties();
  }

  render() {
  const { mine } = this.props;
  const parties = mine.mgr_appointment[0] ? this.props.parties[mine.mgr_appointment[0].person_guid] : null ;
  const permittee = mine.mine_permittee ? this.props.parties[mine.mine_permittee[0].person_guid] : null;

   return (
     <div>
        <ViewMineManager 
          {...this.props} 
          {...this.state}
          toggleModal={this.toggleModal} 
          handleChange={this.handleChange}
          handleSubmit={this.handleManagerSubmit}
          handlePartySubmit={this.handlePartySubmit}
        />
        {parties &&
          <ViewPermittee 
            {...this.props}
            {...this.state}
            toggleModal={this.togglePermitteeModal} 
            handleChange={this.handleChange}
            handleSubmit={this.handlePermitteeSubmit}
            handlePartySubmit={this.handlePartySubmit}
            togglePartyChange={this.togglePartyChange}
          />
      }
    </div>
   )
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