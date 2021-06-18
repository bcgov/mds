import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getMineRegionHash } from "@common/selectors/staticContentSelectors";
import {
  fetchMineNoticeOfWorkApplications,
  createAdminAmendmentApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWorkList } from "@common/selectors/noticeOfWorkSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getMineGuid } from "@common/selectors/mineSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/AddButton";
import MineExplosiveStorageUsePermitTable from "@/components/mine/ExplosiveStorageUsePermit/MineExplosiveStorageUsePermitTable";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {};

export class ExplosiveStorageUsePermit extends Component {
  state = { isLoaded: false };
  handleAddAdminAmendment = (values) => {
    const payload = {
      mine_guid: this.props.mineGuid,
      ...values,
    };
    return this.props
      .createAdminAmendmentApplication(payload)
      .then(() => {
        this.renderDataFromURL(this.props.location.search);
      })
      .finally(() => {
        this.props.closeModal();
      });
  };

  handleOpenAddAdminAmendmentModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddAdminAmendment,
        title: "Add Administrative Amendment ",
      },
      content: modalConfig.ADD_ADMIN_AMENDMENT_MODAL,
    });
  };

  render() {
    return (
      <div>
        <div className="inline-flex between">
          <h4 className="uppercase">Explosive Storage & Use Permit Applications</h4>
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <AddButton onClick={(e) => this.handleOpenAddAdminAmendmentModal(e)}>
              Add Explosive Storage & Use Permit
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <MineExplosiveStorageUsePermitTable
          isLoaded={true}
          handleSearch={this.handleSearch}
          administrativeAmendmentApplications={this.props.noticeOfWorkApplications.filter(
            (app) => app.application_type_code === "ADA"
          )}
          sortField={this.state.params.sort_field}
          sortDir={this.state.params.sort_dir}
          searchParams={this.state.params}
          onExpand={this.onExpand}
          mineRegionHash={this.props.mineRegionHash}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  mineRegionHash: getMineRegionHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNoticeOfWorkApplications,
      openModal,
      closeModal,
      createAdminAmendmentApplication,
    },
    dispatch
  );

ExplosiveStorageUsePermit.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ExplosiveStorageUsePermit);
