import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import AddPartyForm from '@/components/Forms/AddPartyForm';
import * as ModalContent from '@/constants/modalContent';
import { getParties, getPartyIds } from '@/selectors/partiesSelectors';

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired
};

const defaultProps = {
  parties: {},
  partyIds: []
};


export class UpdateMineManagerModal extends Component {
  render() { 
    return (
      <div>
        <UpdateMineManagerForm {...this.props} />
        <p className="center">{ModalContent.PERSON_NOT_FOUND}</p>
        <AddPartyForm onSubmit={this.props.handlePartySubmit} isPerson />
      </div>
      );
  }
}

const mapStateToProps = (state) => ({
    parties: getParties(state),
    partyIds: getPartyIds(state),
  });

UpdateMineManagerModal.propTypes = propTypes;
UpdateMineManagerModal.defaultProps = defaultProps;
export default connect(mapStateToProps, null)(UpdateMineManagerModal);