/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import PropTypes from "prop-types";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getPermits } from "@common/reducers/permitReducer";
import { getBonds, getBondTotals } from "@common/selectors/securitiesSelectors";
import {
  fetchMineBonds,
  fetchMineBondsById,
  createBond,
  updateBond,
} from "@common/actionCreators/securitiesActionCreator";
import { getMineGuid } from "@common/selectors/mineSelectors";
import { currencyMask } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import MineBondTable from "@/components/mine/Securities/MineBondTable";
import MineDashboardContentCard from "@/components/mine/MineDashboardContentCard";
import { modalConfig } from "@/components/modalContent/config";
/**
 * @class  MineSecurityInfo - contains all information relating to bonds and securities
 */

const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  openModal: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchMineBonds: PropTypes.func.isRequired,
  fetchMineBondsById: PropTypes.func.isRequired,
  createBond: PropTypes.func.isRequired,
  updateBond: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  bondTotals: PropTypes.objectOf(PropTypes.number),
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
};

export class MineSecurityInfo extends Component {
  state = {
    expandedRowKeys: [],
    isLoaded: false,
  };

  componentWillMount = () => {
    const { id } = this.props.match.params;
    this.props.fetchPermits(id).then(() => {
      this.props.fetchMineBonds(id).then(() => {
        this.setState({ isLoaded: true });
      });
    });
  };

  openAddBondModal = (event, permitGuid) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Add Bond",
        onSubmit: this.addBondToPermit,
        permitGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_BOND_MODAL,
    });
  };

  openEditBondModal = (event, permitGuid) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Add Bond",
        onSubmit: this.editBond,
        permitGuid,
        editBond: true,
      },
      width: "50vw",
      content: modalConfig.ADD_BOND_MODAL,
    });
  };

  editBond = (values, bondGuid) => {
    this.props.updateBond(values, bondGuid).then(() => {
      this.props.fetchMineBonds(this.props.mineGuid).then(() => {
        this.props.closeModal();
        this.setState({ isLoaded: true });
      });
    });
  };

  releaseOrConfiscateBond = (code, bondGuid, bond) => {
    const newBond = bond;
    delete newBond.permit_guid;
    delete newBond.bond_id;
    delete newBond.bond_guid;
    delete newBond.institution_party_guid;
    const payload = {
      ...newBond,
      bond_status_code: code,
    };
    this.props.updateBond(payload, bondGuid).then(() => {
      this.props.fetchMineBonds(this.props.mineGuid).then(() => {
        this.props.closeModal();
        this.setState({ isLoaded: true });
      });
    });
  };

  addBondToPermit = (values, permitGuid) => {
    const payload = {
      bond: {
        bond_status_code: "ACT",
        ...values,
      },
      permit_guid: permitGuid,
    };

    this.props.createBond(payload).then(() => {
      this.props.fetchMineBonds(this.props.mineGuid).then(() => {
        this.props.closeModal();
        this.setState({ isLoaded: true });
      });
    });
  };

  onExpand = (expanded, record) =>
    this.setState((prevState) => {
      const expandedRowKeys = expanded
        ? prevState.expandedRowKeys.concat(record.key)
        : prevState.expandedRowKeys.filter((key) => {
            key !== record.key;
          });
      return { expandedRowKeys };
    });

  render() {
    return (
      <div className="tab__content">
        <div>
          <h2>Securities</h2>
          <Divider />
          <div className="dashboard--cards">
            <MineDashboardContentCard title="Total Amount Assessed" content="$1,000,000" />
            <MineDashboardContentCard
              title="Total Amount Held"
              content={this.props.bondTotals.amountHeld}
            />
            <MineDashboardContentCard title="Total Bonds" content={this.props.bondTotals.count} />
            <MineDashboardContentCard
              title="Total Amount Confiscated"
              content={this.props.bondTotals.amountConfiscated}
            />
          </div>
          <br />
          <MineBondTable
            isLoaded={this.state.isLoaded}
            permits={this.props.permits}
            expandedRowKeys={this.state.expandedRowKeys}
            onExpand={this.onExpand}
            openAddBondModal={this.openAddBondModal}
            bonds={this.props.bonds}
            releaseOrConfiscateBond={this.releaseOrConfiscateBond}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  mineGuid: getMineGuid(state),
  bonds: getBonds(state),
  bondTotals: getBondTotals(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPermits,
      fetchMineRecordById,
      openModal,
      closeModal,
      fetchMineBonds,
      fetchMineBondsById,
      createBond,
      updateBond,
    },
    dispatch
  );

MineSecurityInfo.propTypes = propTypes;
MineSecurityInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineSecurityInfo);
