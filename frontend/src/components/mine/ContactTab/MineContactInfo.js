import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ViewMineManager from './ViewMineManager';
import ViewPermittee from './ViewPermittee';
import { getCurrentPermitteeIds, getCurrentPermittees } from '@/selectors/mineSelectors';
import { createParty, fetchParties, addMineManager, addPermittee } from '@/actionCreators/partiesActionCreator';
import { fetchMineRecordById } from '@/actionCreators/mineActionCreator';
import { getParties, getPartyIds } from '@/selectors/partiesSelectors';

/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard - houses all the redux logic/state and passes props into children,;
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
  fetchParties: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  addMineManager: PropTypes.func.isRequired,
  addPermittee: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired
};

const defaultProps = {
  mine: {},
  parties: {},
  partyIds: []
};
    
  export class MineContactInfo extends Component {
    state = { modalVisible: false, permitteeModalVisible: false, isPerson: true }
  /**
 * add new parties (firstName, surname || companyName) to db.
 */
  handlePartySubmit = (values, type) => {
    const payload = {type: type, ...values}
    this.props.createParty(payload).then(() => {
      this.props.fetchParties();
    });
  }
  /**
   * change mine manager on record.
   */
  handleManagerSubmit = (values) => {
    this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
      this.setState({ modalVisible: !this.state.modalVisible });
      this.props.fetchMineRecordById(this.props.mine.guid);
      this.props.fetchParties();
    })
  }

  togglePartyChange = (value) => {
    this.setState({
      isPerson: value.target.value,
    });
  }
 /**
   * change permittee on record.
   */
   handlePermitteeSubmit = (values) => {
    const guids = values.permittee.split(", ");
    this.props.addPermittee(guids[0], guids[1], values.party, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
      this.setState({ permitteeModalVisible: !this.state.permitteeModalVisible });
      this.props.fetchMineRecordById(this.props.mine.guid);
      this.props.fetchParties();
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

  togglePermitteeModal = () => {
    this.setState({
      permitteeModalVisible: !this.state.permitteeModalVisible,
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
        {mine.mine_permit[0] &&
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
    permittees: getCurrentPermittees(state),
    permitteeIds: getCurrentPermitteeIds(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchParties,
    createParty,
    addMineManager,
    addPermittee,
    fetchMineRecordById,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MineContactInfo);