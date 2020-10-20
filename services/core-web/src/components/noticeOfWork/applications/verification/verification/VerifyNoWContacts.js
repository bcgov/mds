/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { reduxForm, Field, formValueSelector } from "redux-form";
import { Button } from "antd";
import { Form } from "@ant-design/compatible";
import { resetForm } from "@common/utils/helpers";
import NOWContactForm from "@/components/Forms/noticeOfWork/NOWContactForm";
import { compose } from "redux";
import * as FORM from "@/constants/forms";
import PropTypes from "prop-types";
import { getAddPartyFormState } from "@common/selectors/partiesSelectors";
import { getPartyRelationshipTypesList } from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

const propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  initialValues: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  addPartyFormState: PropTypes.objectOf(PropTypes.any).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {};
export class VerifyNoWContacts extends Component {
  showAddPartyModal = () => {
    this.props.openModal({
      props: {
        title: ModalContent.ADD_CONTACT,
        partyRelationshipTypesList: this.props.partyRelationshipTypesList,
        closeModal: this.props.closeModal,
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
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <h4>Verify Contacts</h4>
        <p>Choose contacts from CORE for the roles provided by the Notice Of Work.</p>
        <br />
        <NOWContactForm
          clearOnSubmit={() => {}}
          initialValues={this.props.initialValues}
          contacts={this.props.contacts}
          partyRelationshipTypesList={this.props.partyRelationshipTypesList}
        />
        <div className="right center-mobile">
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <Button type="primary" htmlType="submit">
              Verify Application
            </Button>
          </AuthorizationWrapper>
        </div>
      </Form>
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

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.NOW_CONTACT_FORM,
  })
)(VerifyNoWContacts);
