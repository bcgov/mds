import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import NOWContactForm from "@/components/Forms/noticeOfWork/NOWContactForm";
import { getAddPartyFormState } from "@common/selectors/partiesSelectors";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";

const propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  initialValues: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  addPartyFormState: PropTypes.objectOf(PropTypes.any).isRequired,
  openModal: PropTypes.func.isRequired,
};

const defaultProps = {};
// eslint-disable-next-line react/prefer-stateless-function
export class VerifyNoWContacts extends Component {
  showAddPartyModal = () => {
    this.props.openModal({
      props: {
        title: ModalContent.ADD_CONTACT,
        partyRelationshipTypesList: this.props.partyRelationshipTypesList,
      },
      content: modalConfig.ADD_QUICK_PARTY,
    });
  };

  componentWillReceiveProps = (nextProps) => {
    if (
      nextProps.addPartyFormState.showingAddPartyForm &&
      this.props.addPartyFormState.showingAddPartyForm !==
        nextProps.addPartyFormState.showingAddPartyForm
    ) {
      this.showAddPartyModal();
    }
  };

  render() {
    return (
      <div>
        <h4>Verify Contacts</h4>
        <p>Choose contacts from CORE for the roles provided by the Notice Of Work.</p>
        <br />
        <NOWContactForm
          clearOnSubmit={() => {}}
          initialValues={this.props.initialValues}
          contacts={this.props.contacts}
          partyRelationshipTypesList={this.props.partyRelationshipTypesList}
        />
      </div>
    );
  }
}

VerifyNoWContacts.propTypes = propTypes;
VerifyNoWContacts.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
  addPartyFormState: getAddPartyFormState(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VerifyNoWContacts);
