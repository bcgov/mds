import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createVCWalletInvitation } from "@common/actionCreators/verifiableCredentialActionCreator";
import { getVCWalletConnectionInvitation } from "@common/selectors/verifiableCredentialSelectors";
import CreateInvitationForm from "@/components/Forms/verifiableCredentials/CreateInvitation";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  createVCWalletInvitation: PropTypes.func.isRequired,
  partyGuid: PropTypes.string.isRequired,
  partyName: PropTypes.string.isRequired,
};

const defaultProps = {
  variance: {},
};

export class CreateInvitationModal extends Component {
  state = { isLoaded: false, invitation: {} };

  render() {
    return (
      <div>
        <CreateInvitationForm
          createVCWalletInvitation={this.props.createVCWalletInvitation}
          closeModal={this.props.closeModal}
          partyGuid={this.props.partyGuid}
          partyName={this.props.partyName}
          invitation={this.state.invitation}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  invitation: getVCWalletConnectionInvitation(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createVCWalletInvitation,
    },
    dispatch
  );

CreateInvitationModal.propTypes = propTypes;
CreateInvitationModal.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(CreateInvitationModal);
