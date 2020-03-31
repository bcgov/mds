import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider, Tabs } from "antd";
import PropTypes from "prop-types";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getPermits } from "@common/reducers/permitReducer";
import {
  getBonds,
  getBondTotals,
  getReclamationInvoices,
} from "@common/selectors/securitiesSelectors";
import {
  getBondTypeOptionsHash,
  getBondStatusOptionsHash,
} from "@common/selectors/staticContentSelectors";
import {
  fetchMineBonds,
  createBond,
  updateBond,
  fetchMineReclamationInvoices,
  createReclamationInvoice,
} from "@common/actionCreators/securitiesActionCreator";
import { getMineGuid } from "@common/selectors/mineSelectors";
import { formatMoney } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import MineBondTable from "@/components/mine/Securities/MineBondTable";
import MineDashboardContentCard from "@/components/mine/MineDashboardContentCard";
import { modalConfig } from "@/components/modalContent/config";

const { TabPane } = Tabs;

/**
 * @class  MineSecurityInfo - contains all information relating to bonds and securities
 */

const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  mineGuid: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchMineBonds: PropTypes.func.isRequired,
  createBond: PropTypes.func.isRequired,
  updateBond: PropTypes.func.isRequired,
  bondTotals: PropTypes.objectOf(PropTypes.number).isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bondTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bonds: PropTypes.arrayOf(CustomPropTypes.bond).isRequired,
};

const defaultProps = {
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
      this.props.fetchMineReclamationInvoices(id);
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
        mineGuid: this.props.mineGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_BOND_MODAL,
    });
  };

  openEditBondModal = (event, bond) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: `Edit Bond`,
        onSubmit: this.editBond,
        editBond: true,
        bond,
        permitGuid: bond.permit_guid,
        mineGuid: this.props.mineGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_BOND_MODAL,
    });
  };

  openViewBondModal = (event, bond) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: `View Bond`,
        bond,
      },
      width: "50vw",
      isViewOnly: true,
      content: modalConfig.VIEW_BOND_MODAL,
    });
  };

  editBond = (values, bondGuid) => {
    const payload = values;
    // payload expects the basic bond object without the following:
    delete payload.permit_guid;
    delete payload.bond_id;
    delete payload.bond_guid;
    delete payload.payer;
    this.props.updateBond(payload, bondGuid).then(() => {
      this.props.fetchMineBonds(this.props.mineGuid).then(() => {
        this.props.closeModal();
        this.setState({ isLoaded: true });
      });
    });
  };

  releaseOrConfiscateBond = (code, bondGuid, bond) => {
    // if bond is confiscated, convert to bond type to Cash
    const payload = {
      ...bond,
      bond_status_code: code,
      bond_type_code: code === "CON" ? "CAS" : bond.bond_type_code,
    };
    this.editBond(payload, bond.bond_guid);
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
        : prevState.expandedRowKeys.filter((key) => key !== record.key);
      return { expandedRowKeys };
    });

  handleAddReclamationInvoice = (values, permitGuid) => {
    console.log(values);
    const payload = {
      reclamation_invoice: {
        ...values,
      },
      permit_guid: permitGuid,
    };
    this.props.createReclamationInvoice(payload);
  };

  openAddReclamationInvoiceModal = (event, permitGuid) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Add Reclamation Invoice",
        onSubmit: this.handleAddReclamationInvoice,
        permitGuid,
        mineGuid: this.props.mineGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_RECLAMATION_INVOICE_MODAL,
    });
  };

  render() {
    return (
      <div className="tab__content">
        <h2>Securities</h2>
        <Tabs type="card">
          <TabPane tab="Bonds" key="1">
            <div>
              <div className="dashboard--cards">
                <MineDashboardContentCard
                  title="Total Security Held"
                  content={formatMoney(this.props.bondTotals.amountHeld)}
                />
                <MineDashboardContentCard
                  title="Total No. of Active Bonds"
                  content={this.props.bondTotals.count}
                />
              </div>
              <br />
              <MineBondTable
                isLoaded={this.state.isLoaded}
                permits={this.props.permits}
                expandedRowKeys={this.state.expandedRowKeys}
                onExpand={this.onExpand}
                openAddBondModal={this.openAddBondModal}
                openAddReclamationInvoiceModal={this.openAddReclamationInvoiceModal}
                bonds={this.props.bonds}
                releaseOrConfiscateBond={this.releaseOrConfiscateBond}
                bondStatusOptionsHash={this.props.bondStatusOptionsHash}
                bondTypeOptionsHash={this.props.bondTypeOptionsHash}
                openViewBondModal={this.openViewBondModal}
                openEditBondModal={this.openEditBondModal}
              />
            </div>
          </TabPane>
          <TabPane tab="Reclamation Invoices" key="2">
            Content of Tab Pane 2
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  mineGuid: getMineGuid(state),
  bonds: getBonds(state),
  bondTotals: getBondTotals(state),
  reclamationInvoices: getReclamationInvoices(state),
  bondStatusOptionsHash: getBondStatusOptionsHash(state),
  bondTypeOptionsHash: getBondTypeOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPermits,
      openModal,
      closeModal,
      fetchMineBonds,
      createBond,
      updateBond,
      fetchMineReclamationInvoices,
      createReclamationInvoice,
    },
    dispatch
  );

MineSecurityInfo.propTypes = propTypes;
MineSecurityInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineSecurityInfo);
