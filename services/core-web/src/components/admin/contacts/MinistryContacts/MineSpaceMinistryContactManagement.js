import React, { Component } from "react";
import { Divider, Alert } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getMineRegionHash,
  getMinistryContactTypesHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getMinistryContacts } from "@mds/common/redux/selectors/minespaceSelector";
import {
  fetchMinistryContacts,
  updateMinistryContact,
  deleteMinistryContact,
  createMinistryContact,
} from "@mds/common/redux/actionCreators/minespaceActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import MinistryContactsTable from "@/components/admin/contacts/MinistryContacts/MinistryContactsTable";
import AddButton from "@/components/common/buttons/AddButton";

const propTypes = {
  fetchMinistryContacts: PropTypes.func.isRequired,
  updateMinistryContact: PropTypes.func.isRequired,
  deleteMinistryContact: PropTypes.func.isRequired,
  createMinistryContact: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  MinistryContacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  MinistryContactTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {};

export class MineSpaceMinistryContactManagement extends Component {
  state = { isLoaded: false };

  componentWillMount() {
    this.handleFetchMinistryContacts();
  }

  handleFetchMinistryContacts = () => {
    this.props.fetchMinistryContacts().then(() => {
      this.setState({ isLoaded: true });
    });
  };

  handleCreateContact = (values) => {
    this.props.createMinistryContact(values).then(() => {
      this.handleFetchMinistryContacts();
      this.props.closeModal();
    });
  };

  handleUpdateContact = (values) => {
    this.props.updateMinistryContact(values.contact_guid, values).then(() => {
      this.handleFetchMinistryContacts();
      this.props.closeModal();
    });
  };

  handleDeleteContact = (guid) => {
    this.setState({ isLoaded: false });
    this.props.deleteMinistryContact(guid).then(() => {
      this.handleFetchMinistryContacts();
    });
  };

  openContactModal = (isEdit, record = null) => {
    return this.props.openModal({
      props: {
        title: isEdit ? "Update MCM Contact" : "Create MCM Contact",
        closeModal: this.props.closeModal,
        initialValues: isEdit ? record : {},
        onSubmit: isEdit ? this.handleUpdateContact : this.handleCreateContact,
        isEdit,
        contacts: this.props.MinistryContacts,
      },
      content: modalConfig.MINISTRY_CONTACT_MODAL,
    });
  };

  render() {
    const officeCodes = ["ROE", "MMO"];
    const offices = this.props.MinistryContacts.filter(({ emli_contact_type_code }) =>
      officeCodes.includes(emli_contact_type_code)
    );
    const contacts = this.props.MinistryContacts.filter(
      ({ emli_contact_type_code }) => !officeCodes.includes(emli_contact_type_code)
    );
    return (
      <div>
        <div className="landing-page__header">
          <div className="inline-flex between">
            <h1>MineSpace MCM Contact Management</h1>
            <AuthorizationWrapper permission={Permission.ADMIN}>
              <AddButton onClick={() => this.openContactModal(false)}>
                Create MCM Contact
              </AddButton>
            </AuthorizationWrapper>
          </div>
        </div>
        <div className="tab__content">
          <Alert
            message="MCM contacts and offices are displayed in multiple places within Core and MineSpace."
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
          <MinistryContactsTable
            isLoaded={this.state.isLoaded}
            contacts={offices}
            isOffice
            mineRegionHash={this.props.mineRegionHash}
            openEditModal={this.openContactModal}
            handleDeleteContact={this.handleDeleteContact}
            MinistryContactTypesHash={this.props.MinistryContactTypesHash}
          />
          <br />
          <h2>Contacts</h2>
          <Divider />
          <MinistryContactsTable
            isLoaded={this.state.isLoaded}
            contacts={contacts}
            mineRegionHash={this.props.mineRegionHash}
            openEditModal={this.openContactModal}
            handleDeleteContact={this.handleDeleteContact}
            MinistryContactTypesHash={this.props.MinistryContactTypesHash}
          />
        </div>
      </div>
    );
  }
}

MineSpaceMinistryContactManagement.propTypes = propTypes;
MineSpaceMinistryContactManagement.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  MinistryContacts: getMinistryContacts(state),
  mineRegionHash: getMineRegionHash(state),
  MinistryContactTypesHash: getMinistryContactTypesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMinistryContacts,
      updateMinistryContact,
      deleteMinistryContact,
      createMinistryContact,
      openModal,
      closeModal,
    },
    dispatch
  );

export default AuthorizationGuard(Permission.EDIT_MINISTRY_CONTACTS)(
  connect(mapStateToProps, mapDispatchToProps)(MineSpaceMinistryContactManagement)
);
