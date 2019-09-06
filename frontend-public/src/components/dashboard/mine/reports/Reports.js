import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { getMine } from "@/selectors/userMineSelectors";
import CustomPropTypes from "@/customPropTypes";
import Loading from "@/components/common/Loading";
import { fetchMineRecordById } from "@/actionCreators/userDashboardActionCreator";
import { fetchMineReports, updateMineReport } from "@/actionCreators/reportActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import { getMineReports } from "@/selectors/reportSelectors";
import MineReportTable from "@/components/dashboard/mine/reports/MineReportTable";
import { fetchMineReportDefinitionOptions } from "@/actionCreators/staticContentActionCreator";
import { getMineReportDefinitionOptions } from "@/reducers/staticContentReducer";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchMineReportDefinitionOptions: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateMineReport: PropTypes.func.isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class Reports extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchMineReportDefinitionOptions();
    const { id } = this.props.match.params;
    this.props.fetchMineReports(id);
    this.props.fetchMineRecordById(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleEditReport = (values) => {
    this.props
      .updateMineReport(this.props.mine.mine_guid, values.mine_report_guid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mine.mine_guid));
  };

  openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: report,
        onSubmit,
        title: `Edit report for ${this.props.mine.mine_name}`,
        mineGuid: this.props.mine.mine_guid,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  render() {
    if (!this.state.isLoaded) {
      return <Loading />;
    }

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
      <div className="mine-info-padding">
        {this.props.mineReports && (
          <div>
            <h1 className="mine-title">{this.props.mine.mine_name}</h1>
            <p>Mine No. {this.props.mine.mine_no}</p>
            <h2>Reports</h2>
            <MineReportTable
              openEditReportModal={this.openEditReportModal}
              handleEditReport={this.handleEditReport}
              mineReports={filteredReports}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineReports: getMineReports(state),
  mine: getMine(state),
  mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReportDefinitionOptions,
      fetchMineRecordById,
      fetchMineReports,
      updateMineReport,
      openModal,
      closeModal,
    },
    dispatch
  );

Reports.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Reports);
