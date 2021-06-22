/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  fetchExplosivesPermits,
  createExplosivesPermit,
} from "@common/actionCreators/explosivesPermitActionCreator";
import { getExplosivesPermits } from "@common/selectors/explosivesPermitSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getMineGuid } from "@common/selectors/mineSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/AddButton";
import MineExplosivesPermitTable from "@/components/mine/ExplosivesPermit/MineExplosivesPermitTable";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {};

export class ExplosivesPermit extends Component {
  state = { isLoaded: false, params: {} };

  handleAddESUP = (values) => {
    const payload = {
      mine_guid: this.props.mineGuid,
      ...values,
    };
    // return this.props
    //   .createExplosivesPermit(payload)
    //   .then(() => {
    //     this.props.closeModal();
    //   });
  };

  handleOpenAddESUPModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddESUP,
        title: "Add Explosives Storage & Use Permit",
      },
      content: modalConfig.EXPLOSIVES_PERMIT_MODAL,
    });
  };

  render() {
    return (
      <div>
        <br />
        <div className="inline-flex between">
          <h4 className="uppercase">Explosive Storages & Use Permit Applications</h4>
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <AddButton onClick={(e) => this.handleOpenAddESUPModal(e)}>
              Add Explosives Storage & Use Permit
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <MineExplosivesPermitTable
          isLoaded
          handleSearch={this.handleSearch}
          data={this.props.explosivesPermits}
          onExpand={this.onExpand}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  explosivesPermits: getExplosivesPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createExplosivesPermit,
      openModal,
      closeModal,
      fetchExplosivesPermits,
    },
    dispatch
  );

ExplosivesPermit.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ExplosivesPermit);
