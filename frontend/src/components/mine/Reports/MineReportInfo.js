import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
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
import { getMineReports } from "../../../reducers/reportReducer";
import { Button } from "antd/lib/radio";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  reports: PropTypes.arrayOf(CustomPropTypes.mineReport),
  fetchMineReports: PropTypes.func.isRequired,
  updateMineReport: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  hsrcDefinedReportsDropDown: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const defaultProps = {
  hsrcDefinedReportsDropDown: [{ value: 1, label: "help" }],
  reports: [],
};

export class MineReportInfo extends Component {
  handleEditReport = (values) => {
    updateMineReport(this.props.mine.mine_guid, values.report_guid, values);
  };

  handleAddReport = (values) => {
    createMineReport(this.props.mine.mine_guid, values);
  };

  openAddReportModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddReport,
        title: `Add report for ${this.props.mine.mine_name}`,
        mine_guid: this.props.mine.mine_guid,
        hsrcDefinedReportsDropDown: this.props.hsrcDefinedReportsDropDown,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  openEditReportModal = (event, report) => {
    event.preventDefault();

    this.props.openModal({
      props: {
        initialValues: report,
        onSubmit: this.handleEditReport,
        title: `Edit report for ${this.props.mine.mine_name}`,
      },
      content: modalConfig.EDIT_REPORT,
    });
  };

  render() {
    return (
      <div>
        <AuthorizationWrapper
          permission={Permission.CREATE}
          isMajorMine={this.props.mine.major_mine_ind}
        >
          <AddButton
            onClick={(event) =>
              this.openAddReportModal(
                event,
                this.handleAddReport,
                `${ModalContent.ADD_REPORT} to ${this.props.mine.mine_name}`
              )
            }
          >
            Add a Report
          </AddButton>
        </AuthorizationWrapper>
        <MineReportTable openEditReportModal={this.openEditReportModal} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  reports: getMineReports(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReports,
      updateMineReport,
    },
    dispatch
  );

MineReportInfo.propTypes = propTypes;
MineReportInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineReportInfo);
