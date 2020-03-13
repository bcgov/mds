import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Divider } from "antd";
import {
  fetchMineReports,
  updateMineReport,
  deleteMineReport,
} from "@common/actionCreators/reportActionCreator";
import { getMineReports } from "@common/selectors/reportSelectors";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getMineReportDefinitionOptions } from "@common/reducers/staticContentReducer";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  updateMineReport: PropTypes.func.isRequired,
  deleteMineReport: PropTypes.func.isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class MineTailingsInfo extends Component {
  state = { mine: {}, isLoaded: false, params: { sort_field: "received_date", sort_dir: "desc" } };

  componentDidMount() {
    this.setState({ mine: this.props.mines[this.props.mineGuid] });
    this.props.fetchMineReports(this.props.mineGuid).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleEditReport = (report) => {
    this.props
      .updateMineReport(report.mine_guid, report.mine_report_guid, report)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(report.mine_guid));
  };

  handleRemoveReport = (report) => {
    this.props
      .deleteMineReport(report.mine_guid, report.mine_report_guid)
      .then(() => this.props.fetchMineReports(report.mine_guid));
  };

  openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: report,
        onSubmit,
        title: `Edit report for ${this.state.mine.mine_name}`,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  handleReportFilterSubmit = (params) => {
    this.setState({ params: { sort_field: params.sort_field, sort_dir: params.sort_dir } });
  };

  render() {
    const mine = this.props.mines[this.props.mineGuid];

    const filteredReportDefinitionGuids =
      this.props.mineReportDefinitionOptions &&
      this.props.mineReportDefinitionOptions
        .filter((option) =>
          option.categories.map((category) => category.mine_report_category).includes("TSF")
        )
        .map((definition) => definition.mine_report_definition_guid);

    const filteredReports =
      this.props.mineReports &&
      this.props.mineReports.filter((report) =>
        filteredReportDefinitionGuids.includes(report.mine_report_definition_guid.toLowerCase())
      );

    return (
      <div className="tab__content">
        <div>
          <h2>Tailings</h2>
          <Divider />
        </div>
        {mine.mine_tailings_storage_facilities.map((facility) => (
          <Row
            key={facility.mine_tailings_storage_facility_guid}
            gutter={16}
            style={{ marginBottom: "10px" }}
          >
            <Col span={6}>
              <h3>{facility.mine_tailings_storage_facility_name}</h3>
            </Col>
          </Row>
        ))}
        <br />
        <br />
        <div>
          <div className="inline-flex between">
            <div>
              <h3>Reports</h3>
            </div>
          </div>
          <MineReportTable
            isLoaded={this.state.isLoaded}
            mineReports={filteredReports}
            openEditReportModal={this.openEditReportModal}
            handleEditReport={this.handleEditReport}
            handleRemoveReport={this.handleRemoveReport}
            handleTableChange={this.handleReportFilterSubmit}
            sortField={this.state.params.sort_field}
            sortDir={this.state.params.sort_dir}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineReports: getMineReports(state),
  mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReports,
      updateMineReport,
      deleteMineReport,
      openModal,
      closeModal,
    },
    dispatch
  );

MineTailingsInfo.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineTailingsInfo);
