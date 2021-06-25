/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  fetchExplosivesPermits,
  createExplosivesPermit,
  updateExplosivesPermit,
} from "@common/actionCreators/explosivesPermitActionCreator";
import { getExplosivesPermits } from "@common/selectors/explosivesPermitSelectors";
import { getExplosivesPermitStatusOptionsHash } from "@common/selectors/staticContentSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/AddButton";
import CustomPropTypes from "@/customPropTypes";
import MineExplosivesPermitTable from "@/components/mine/ExplosivesPermit/MineExplosivesPermitTable";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  isPermit: PropTypes.bool,
  updateExplosivesPermit: PropTypes.func.isRequired,
  createExplosivesPermit: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchExplosivesPermits: PropTypes.func.isRequired,
  updateExplosivesPermit: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
};

const defaultProps = {
  isPermit: false,
};

export class ExplosivesPermit extends Component {
  state = { isLoaded: false, params: {} };

  handleAddExplosivesPermit = (values) => {
    const payload = {
      originating_system: "Core",
      ...values,
    };
    return this.props.createExplosivesPermit(this.props.mineGuid, payload).then(() => {
      this.props.fetchExplosivesPermits(this.props.mineGuid);
      this.props.closeModal();
    });
  };

  handleOpenAddExplosivesPermitModal = (event, record = null) => {
    const initialValues = record ? record : {};
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: record ? this.handleUpdatePermit : this.handleAddExplosivesPermit,
        title: "Add Explosives Storage & Use Permit",
        initialValues,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_MODAL,
      width: "75vw",
    });
  };

  handleUpdatePermit = (values) => {
    const payload = {
      ...values,
    };
    return this.props
      .updateExplosivesPermit(this.props.mineGuid, values.explosives_permit_guid, payload)
      .then(() => {
        this.props.fetchExplosivesPermits(this.props.mineGuid);
        this.props.closeModal();
      });
  };

  handleOpenViewMagazineModal = (event, record, type) => {
    const title = type === "EXP" ? "Explosive Magazine" : "Detonator Magazine";
    event.preventDefault();
    this.props.openModal({
      props: {
        title,
        explosivesPermit: record,
        type,
      },
      content: modalConfig.VIEW_MAGAZINE_MODAL,
      isViewOnly: true,
    });
  };

  handleIssueExplosivesPermit = (values) => {
    const payload = {
      originating_system: "Core",
      ...values,
    };
    return this.props.createExplosivesPermit(this.props.mineGuid, payload).then(() => {
      this.props.closeModal();
    });
  };

  handleOpenExplosivesPermitDecisionModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleIssueExplosivesPermit,
        title: "Issue Explosives Storage & Use Permit",
      },
      content: modalConfig.EXPLOSIVES_PERMIT_DECISION_MODAL,
      width: "75vw",
    });
  };

  render() {
    const title = this.props.isPermit
      ? "Explosive Storages & Use Permits"
      : "Explosive Storages & Use Permit Applications";
    const data = this.props.isPermit
      ? this.props.explosivesPermits.filter(
          ({ application_status }) => application_status === "APP"
        )
      : this.props.explosivesPermits;
    return (
      <div>
        <br />
        <div className="inline-flex between">
          <h4 className="uppercase">{title}</h4>
          {!this.props.isPermit && (
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              <AddButton onClick={(e) => this.handleOpenAddExplosivesPermitModal(e)}>
                Add Explosives Storage & Use Permit Application
              </AddButton>
            </AuthorizationWrapper>
          )}
        </div>
        <br />
        <MineExplosivesPermitTable
          isLoaded
          data={data}
          isPermit={this.props.isPermit}
          handleOpenExplosivesPermitDecisionModal={this.handleOpenExplosivesPermitDecisionModal}
          handleOpenAddExplosivesPermitModal={this.handleOpenAddExplosivesPermitModal}
          handleOpenViewMagazineModal={this.handleOpenViewMagazineModal}
          explosivesPermitStatusOptionsHash={this.props.explosivesPermitStatusOptionsHash}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  mines: getMines(state),
  explosivesPermits: getExplosivesPermits(state),
  explosivesPermitStatusOptionsHash: getExplosivesPermitStatusOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createExplosivesPermit,
      openModal,
      closeModal,
      fetchExplosivesPermits,
      updateExplosivesPermit,
    },
    dispatch
  );

ExplosivesPermit.propTypes = propTypes;
ExplosivesPermit.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ExplosivesPermit);
