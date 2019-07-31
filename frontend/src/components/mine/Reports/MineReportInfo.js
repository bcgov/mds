import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import { openModal, closeModal } from "@/actions/modalActions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  fetchMineReports,
  updateMineReport,
  createMineReport,
} from "@/actionCreators/reportActionCreator";
import AddButton from "@/components/common/AddButton";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { getMineReports } from "@/selectors/reportSelectors";
import { getMines, getMineGuid } from "@/selectors/mineSelectors";

/**
 * @class  MineReportInfo - contains all permit information
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  updateMineReport: PropTypes.func.isRequired,
  createMineReport: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class MineReportInfo extends Component {
  componentWillMount = () => {
    this.props.fetchMineReports(this.props.mineGuid);
  };

  handleEditReport = (values) => {
    this.props
      .updateMineReport(this.props.mineGuid, values.report_guid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mineGuid));
  };

  handleAddReport = (values) => {
    this.props
      .createMineReport(this.props.mineGuid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mineGuid));
  };

  openAddReportModal = (event, title) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddReport,
        title,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  openEditReportModal = (event, report) => {
    const mine = this.props.mines[this.props.mineGuid];
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: report,
        onSubmit: this.handleEditReport,
        title: `Edit report for ${mine.mine_name}`,
      },
      content: modalConfig.EDIT_REPORT,
    });
  };

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div className="inline-flex flex-end">
          <AuthorizationWrapper
            permission={Permission.EDIT_REPORTS}
            isMajorMine={mine.major_mine_ind}
          >
            <AddButton
              onClick={(event) =>
                this.openAddReportModal(event, `${ModalContent.ADD_REPORT} to ${mine.mine_name}`)
              }
            >
              Add a Report
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <MineReportTable
          openEditReportModal={this.openEditReportModal}
          mineReports={this.props.mineReports}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  mineReports: getMineReports(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReports,
      updateMineReport,
      createMineReport,
      openModal,
      closeModal,
    },
    dispatch
  );

MineReportInfo.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineReportInfo);
