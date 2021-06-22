/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  fetchExplosivePermits,
  createExplosivePermit,
} from "@common/actionCreators/explosivePermitActionCreator";
import { getExplosivePermits } from "@common/selectors/explosivePermitSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getMineGuid } from "@common/selectors/mineSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/AddButton";
import MineExplosiveStorageUsePermitTable from "@/components/mine/ExplosiveStorageUsePermit/MineExplosiveStorageUsePermitTable";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {};

export class ExplosiveStorageUsePermit extends Component {
  state = { isLoaded: false, params: {} };

  handleAddESUP = (values) => {
    const payload = {
      mine_guid: this.props.mineGuid,
      ...values,
    };
    // return this.props
    //   .createExplosivePermit(payload)
    //   .then(() => {
    //     this.props.closeModal();
    //   });
  };

  handleOpenAddESUPModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddESUP,
        title: "Add Explosive Storage & Use Permit",
      },
      content: modalConfig.EXPLOSIVE_STORAGE_USE_PERMIT_MODAL,
    });
  };

  render() {
    return (
      <div>
        <br />
        <div className="inline-flex between">
          <h4 className="uppercase">Explosive Storage & Use Permit Applications</h4>
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <AddButton onClick={(e) => this.handleOpenAddESUPModal(e)}>
              Add Explosive Storage & Use Permit
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <MineExplosiveStorageUsePermitTable
          isLoaded
          handleSearch={this.handleSearch}
          data={this.props.explosivePermits}
          onExpand={this.onExpand}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  explosivePermits: getExplosivePermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createExplosivePermit,
      openModal,
      closeModal,
      fetchExplosivePermits,
    },
    dispatch
  );

ExplosiveStorageUsePermit.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ExplosiveStorageUsePermit);
