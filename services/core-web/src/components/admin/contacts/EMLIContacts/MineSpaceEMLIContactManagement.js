import React, { Component } from "react";
import { Divider, Alert } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getMineRegionHash,
  getEMLIContactTypesHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getEMLIContacts } from "@mds/common/redux/selectors/minespaceSelector";
import {
  fetchEMLIContacts,
  updateEMLIContact,
  deleteEMLIContact,
  createEMLIContact,
} from "@mds/common/redux/actionCreators/minespaceActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import EMLIContactsTable from "@/components/admin/contacts/EMLIContacts/EMLIContactsTable";
import AddButton from "@/components/common/buttons/AddButton";

const propTypes = {
  fetchEMLIContacts: PropTypes.func.isRequired,
  updateEMLIContact: PropTypes.func.isRequired,
  deleteEMLIContact: PropTypes.func.isRequired,
  createEMLIContact: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  EMLIContacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  EMLIContactTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {};

export class MineSpaceEMLIContactManagement extends Component {
  state = { isLoaded: false };

  componentWillMount() {
    this.handleFetchEMLIContacts();
  }

  handleFetchEMLIContacts = () => {
    this.props.fetchEMLIContacts().then(() => {
      this.setState({ isLoaded: true });
    });
  };

  handleCreateContact = (values) => {
    this.props.createEMLIContact(values).then(() => {
      this.handleFetchEMLIContacts();
      this.props.closeModal();
    });
  };

  handleUpdateContact = (values) => {
    this.props.updateEMLIContact(values.contact_guid, values).then(() => {
      this.handleFetchEMLIContacts();
      this.props.closeModal();
    });
  };

  handleDeleteContact = (guid) => {
    this.setState({ isLoaded: false });
    this.props.deleteEMLIContact(guid).then(() => {
      this.handleFetchEMLIContacts();
    });
  };

  openContactModal = (isEdit, record = null) => {
    return this.props.openModal({
      props: {
        title: isEdit ? "Update EMLI Contact" : "Create EMLI Contact",
        closeModal: this.props.closeModal,
        initialValues: isEdit ? record : {},
        onSubmit: isEdit ? this.handleUpdateContact : this.handleCreateContact,
        isEdit,
        contacts: this.props.EMLIContacts,
      },
      content: modalConfig.EMLI_CONTACT_MODAL,
    });
  };

  render() {
    const officeCodes = ["ROE", "MMO"];
    const offices = this.props.EMLIContacts.filter(({ emli_contact_type_code }) =>
      officeCodes.includes(emli_contact_type_code)
    );
    const contacts = this.props.EMLIContacts.filter(
      ({ emli_contact_type_code }) => !officeCodes.includes(emli_contact_type_code)
    );
    return (
      <div>
        <div className="landing-page__header">
          <div className="inline-flex between">
            <h1>MineSpace EMLI Contact Management</h1>
            <AuthorizationWrapper permission={Permission.ADMIN}>
              <AddButton onClick={() => this.openContactModal(false)}>
                Create EMLI Contact
              </AddButton>
            </AuthorizationWrapper>
          </div>
        </div>
        <div className="tab__content">
          <Alert
            message="EMLI contacts and offices are displayed in multiple places within Core and MineSpace."
            closable
            description={
              <>
                The Contacts are displayed in MineSpace to proponents.
                <br />
                The Offices are displayed in MineSpace, shown on the footer on permits, and NoW
                documents, and are the default email address for variances, code required reports,
                and mine information notifications.
              </>
            }
            type="info"
            showIcon
          />
          <h2>Offices</h2>
          <Divider />
          <EMLIContactsTable
            isLoaded={this.state.isLoaded}
            contacts={offices}
            isOffice
            mineRegionHash={this.props.mineRegionHash}
            openEditModal={this.openContactModal}
            handleDeleteContact={this.handleDeleteContact}
            EMLIContactTypesHash={this.props.EMLIContactTypesHash}
          />
          <br />
          <h2>Contacts</h2>
          <Divider />
          <EMLIContactsTable
            isLoaded={this.state.isLoaded}
            contacts={contacts}
            mineRegionHash={this.props.mineRegionHash}
            openEditModal={this.openContactModal}
            handleDeleteContact={this.handleDeleteContact}
            EMLIContactTypesHash={this.props.EMLIContactTypesHash}
          />
        </div>
      </div>
    );
  }
}

MineSpaceEMLIContactManagement.propTypes = propTypes;
MineSpaceEMLIContactManagement.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  EMLIContacts: getEMLIContacts(state),
  mineRegionHash: getMineRegionHash(state),
  EMLIContactTypesHash: getEMLIContactTypesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchEMLIContacts,
      updateEMLIContact,
      deleteEMLIContact,
      createEMLIContact,
      openModal,
      closeModal,
    },
    dispatch
  );

export default AuthorizationGuard(Permission.EDIT_EMLI_CONTACTS)(
  connect(mapStateToProps, mapDispatchToProps)(MineSpaceEMLIContactManagement)
);
