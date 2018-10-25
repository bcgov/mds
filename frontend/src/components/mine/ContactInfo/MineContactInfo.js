import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ViewMineManager from './ViewMineManager';
import ViewPermittee from './ViewPermittee';
import { openModal, closeModal} from '@/actions/modalActions';
import { getCurrentPermitteeIds, getCurrentPermittees } from '@/selectors/mineSelectors';
import { createParty, fetchParties, addMineManager, addPermittee } from '@/actionCreators/partiesActionCreator';
import { fetchMineRecordById } from '@/actionCreators/mineActionCreator';

/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard - houses all the redux logic/state and passes props into children,;
 */

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  fetchParties: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  addMineManager: PropTypes.func.isRequired,
  addPermittee: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  permittees: PropTypes.object.isRequired,
  permitteeIds: PropTypes.array.isRequired
};

const defaultProps = {
  mine: {},
  permitteeIds: [],
  permittees: {}
};
    
  export class MineContactInfo extends Component {
    state = { mineManagerHistroyVisible: false, }
  /**
 * add new parties (firstName, surname || companyName) to db.
 */
  handlePartySubmit = (values, type) => {
    const payload = {type: type, ...values}
    this.props.createParty(payload).then(() => {
      this.props.fetchParties();
    });
  }

  handleChange = (value) => {
    if (value.length > 2){
      this.props.fetchParties(value);
    }
    else if (value.length === 0) {
      this.props.fetchParties();
    }
  }

  toggleMineManagerHistory = () => {
    this.setState({
      mineManagerHistroyVisible: !this.state.mineManagerHistroyVisible,
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
          handleChange={this.handleChange}
          handlePartySubmit={this.handlePartySubmit}
          toggleMineManagerHistory={this.toggleMineManagerHistory}
        />
        {mine.mine_permit[0] &&
          <ViewPermittee 
            {...this.props}
            handleChange={this.handleChange}
            handlePartySubmit={this.handlePartySubmit}
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
    openModal, 
    closeModal,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MineContactInfo);