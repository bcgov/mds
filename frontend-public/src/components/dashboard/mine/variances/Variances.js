import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { getMine } from "@/selectors/userMineSelectors";
import CustomPropTypes from "@/customPropTypes";
import Loading from "@/components/common/Loading";
import { fetchMineRecordById } from "@/actionCreators/userDashboardActionCreator";
import {
  fetchVariancesByMine,
  fetchMineComplianceCodes,
  fetchVarianceStatusOptions,
} from "@/actionCreators/varianceActionCreator";
import {
  getVarianceApplications,
  getApprovedVariances,
  getVarianceStatusOptionsHash,
  getHSRCMComplianceCodesHash,
} from "@/selectors/varianceSelectors";
import VarianceTable from "@/components/dashboard/mine/variances/VarianceTable";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchVarianceStatusOptions: PropTypes.func.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  approvedVariances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  varianceApplications: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
};

export class Variances extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchMineRecordById(id).then(() => {
      this.setState({ isLoaded: true });
    });
    this.props.fetchVariancesByMine(id);
    this.props.fetchMineComplianceCodes();
    this.props.fetchVarianceStatusOptions();
  }

  render() {
    if (!this.state.isLoaded) {
      return <Loading />;
    }

    return (
      <div className="mine-info-padding">
        {this.props.mine && (
          <div>
            <h1 className="mine-title">{this.props.mine.mine_name}</h1>
            <p>Mine No. {this.props.mine.mine_no}</p>
            <br />
            <h2>Variance Applications</h2>
            <VarianceTable
              variances={this.props.varianceApplications}
              isApplication
              mine={this.props.mine}
              varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
              complianceCodesHash={this.props.complianceCodesHash}
            />
            <h2>Approved Variances</h2>
            <VarianceTable
              variances={this.props.approvedVariances}
              mine={this.props.mine}
              varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
              complianceCodesHash={this.props.complianceCodesHash}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mine: getMine(state),
  varianceApplications: getVarianceApplications(state),
  approvedVariances: getApprovedVariances(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      fetchVariancesByMine,
      fetchMineComplianceCodes,
      fetchVarianceStatusOptions,
    },
    dispatch
  );

Variances.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Variances);
