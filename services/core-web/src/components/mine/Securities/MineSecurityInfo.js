import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Tabs } from "antd";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getPermits } from "@common/selectors/permitSelectors";
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
  transferBond,
  fetchMineReclamationInvoices,
  createReclamationInvoice,
  updateReclamationInvoice,
} from "@common/actionCreators/securitiesActionCreator";
import { getMineGuid } from "@common/selectors/mineSelectors";
import { formatMoney } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import MineBondTable from "@/components/mine/Securities/MineBondTable";
import MineReclamationInvoiceTable from "@/components/mine/Securities/MineReclamationInvoiceTable";
import MineDashboardContentCard from "@/components/mine/MineDashboardContentCard";
import { CoreTooltip } from "@/components/common/CoreTooltip";
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
  mineGuid: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchMineBonds: PropTypes.func.isRequired,
  createBond: PropTypes.func.isRequired,
  updateBond: PropTypes.func.isRequired,
  transferBond: PropTypes.func.isRequired,
  fetchMineReclamationInvoices: PropTypes.func.isRequired,
  createReclamationInvoice: PropTypes.func.isRequired,
  updateReclamationInvoice: PropTypes.func.isRequired,
  bondTotals: PropTypes.objectOf(PropTypes.number).isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bondTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bonds: PropTypes.arrayOf(CustomPropTypes.bond).isRequired,
  invoices: PropTypes.arrayOf(CustomPropTypes.invoices).isRequired,
};

const defaultProps = {
  permits: [],
};

export class MineSecurityInfo extends Component {
  state = {
    isBondLoaded: false,
    isInvoicesLoaded: false,
  };

  componentWillMount = () => {
    const { id } = this.props.match.params;
    this.props.fetchPermits(id).then(() => {
      this.props
        .fetchMineReclamationInvoices(id)
        .then(() => this.setState({ isInvoicesLoaded: true }));
      this.props.fetchMineBonds(id).then(() => {
        this.setState({ isBondLoaded: true });
      });
    });
  };

  recordsByPermit = (permit, records) =>
    records.filter(({ permit_guid }) => permit_guid === permit.permit_guid);

  activeBondCount = (permit) =>
    this.props.bonds.filter(
      ({ permit_guid, bond_status_code }) =>
        permit_guid === permit.permit_guid && bond_status_code === "ACT"
    ).length;

  getAmountSum = (permit) =>
    this.props.invoices
      .filter(({ permit_guid }) => permit_guid === permit.permit_guid)
      .reduce((sum, invoice) => +sum + +invoice.amount, 0);

  getBalance = (permit) => permit.confiscated_bond_total - this.getAmountSum(permit);

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
        title: "Edit Bond",
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

  openTransferBondModal = (event, bond) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Transfer Bond",
        onSubmit: this.transferBond,
        editBond: true,
        bond,
        permitGuid: bond.permit_guid,
        permits: this.props.permits,
      },
      width: "50vw",
      content: modalConfig.TRANSFER_BOND_MODAL,
    });
  };

  transferBond = (values, bond) => {
    return this.props
      .transferBond(values, bond.bond_guid)
      .then(() => {
        this.setState({ isBondLoaded: false });
        this.props
          .fetchMineBonds(this.props.mineGuid)
          .finally(() => this.setState({ isBondLoaded: true }));
      })
      .then(() => this.props.closeModal());
  };

  openViewBondModal = (event, bond) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "View Bond",
        bond,
      },
      width: "50vw",
      isViewOnly: true,
      content: modalConfig.VIEW_BOND_MODAL,
    });
  };

  openCloseBondModal = (event, bond, bondStatusCode) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title:
          (bondStatusCode === "REL" && "Release Bond") ||
          (bondStatusCode === "CON" && "Confiscate Bond"),
        onSubmit: this.closeBond,
        editBond: true,
        bond,
        bondStatusCode,
        bondStatusOptionsHash: this.props.bondStatusOptionsHash,
        permitGuid: bond.permit_guid,
        mineGuid: this.props.mineGuid,
        initialValues: { project_id: bond.project_id },
      },
      width: "50vw",
      content: modalConfig.CLOSE_BOND_MODAL,
    });
  };

  editBond = (values, bondGuid) => {
    const payload = values;
    delete payload.permit_guid;
    delete payload.bond_id;
    delete payload.bond_guid;
    delete payload.payer;
    return this.props
      .updateBond(payload, bondGuid)
      .then(() => {
        this.setState({ isBondLoaded: false });
        this.props.fetchPermits(this.props.mineGuid);
        this.props
          .fetchMineBonds(this.props.mineGuid)
          .finally(() => this.setState({ isBondLoaded: true }));
      })
      .then(() => this.props.closeModal());
  };

  closeBond = (bondStatusCode, values, bond) => {
    const payload = {
      ...bond,
      ...values,
      bond_status_code: bondStatusCode,
      bond_type_code: bondStatusCode === "CON" ? "CAS" : bond.bond_type_code,
    };
    return this.editBond(payload, bond.bond_guid);
  };

  addBondToPermit = (values, permitGuid) => {
    const payload = {
      bond: {
        bond_status_code: "ACT",
        ...values,
      },
      permit_guid: permitGuid,
    };
    return this.props
      .createBond(payload)
      .then(() => {
        this.setState({ isBondLoaded: false });
        this.props.fetchPermits(this.props.mineGuid);
        this.props
          .fetchMineBonds(this.props.mineGuid)
          .finally(() => this.setState({ isBondLoaded: true }));
      })
      .then(() => this.props.closeModal());
  };

  handleAddReclamationInvoice = (values, permitGuid) => {
    const payload = {
      reclamation_invoice: {
        ...values,
      },
      permit_guid: permitGuid,
    };
    return this.props
      .createReclamationInvoice(payload)
      .then(() => {
        this.props.fetchPermits(this.props.mineGuid);
        this.props.fetchMineReclamationInvoices(this.props.mineGuid).then(() => {
          this.setState({ isInvoicesLoaded: true });
        });
      })
      .then(() => this.props.closeModal());
  };

  handleUpdateReclamationInvoice = (values, invoiceGuid) => {
    const payload = values;
    delete payload.permit_guid;
    delete payload.reclamation_invoice_id;
    delete payload.reclamation_invoice_guid;
    return this.props
      .updateReclamationInvoice(payload, invoiceGuid)
      .then(() => {
        this.props.fetchPermits(this.props.mineGuid);
        this.props.fetchMineReclamationInvoices(this.props.mineGuid).then(() => {
          this.setState({ isInvoicesLoaded: true });
        });
      })
      .then(() => this.props.closeModal());
  };

  openAddReclamationInvoiceModal = (event, permit, balance) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Add Reclamation Invoice",
        onSubmit: this.handleAddReclamationInvoice,
        permitGuid: permit.permit_guid,
        invoice: { project_id: permit.project_id },
        mineGuid: this.props.mineGuid,
        balance,
      },
      width: "50vw",
      content: modalConfig.ADD_RECLAMATION_INVOICE_MODAL,
    });
  };

  openEditReclamationInvoiceModal = (event, invoice, balance) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Edit Reclamation Invoice",
        onSubmit: this.handleUpdateReclamationInvoice,
        mineGuid: this.props.mineGuid,
        invoice,
        edit: true,
        balance,
      },
      width: "50vw",
      content: modalConfig.ADD_RECLAMATION_INVOICE_MODAL,
    });
  };

  render() {
    return (
      <div className="tab__content">
        <h2>Securities</h2>
        <br />
        <Tabs type="card" style={{ textAlign: "left !important" }}>
          <Tabs.TabPane tab={`Bonds (${this.props.bonds.length})`} key="1">
            <div>
              <div className="dashboard--cards">
                <MineDashboardContentCard
                  title={
                    <span>
                      Total Security Held
                      <CoreTooltip title="Total Security Held: This is the total amount of all active bonds held on this mine record. If the mine is on a payment schedule, it shows only what has been paid to date. It includes any interest earned." />
                    </span>
                  }
                  content={formatMoney(this.props.bondTotals.amountHeld)}
                />
                <MineDashboardContentCard
                  title={
                    <span>
                      Total Active Bonds
                      <CoreTooltip title="Total Active Bonds: This is the number of active bonds held by the Ministry for all the permits on this mine record. It does not include bonds that have been released or confiscated." />
                    </span>
                  }
                  content={this.props.bondTotals.count}
                />
              </div>
              <br />
              <h4 className="uppercase">Bonds</h4>
              <p>Record all bonds received for each permit this mine holds.</p>
              <br />
              <MineBondTable
                isLoaded={this.state.isBondLoaded}
                permits={this.props.permits}
                openAddBondModal={this.openAddBondModal}
                bonds={this.props.bonds}
                bondStatusOptionsHash={this.props.bondStatusOptionsHash}
                bondTypeOptionsHash={this.props.bondTypeOptionsHash}
                openViewBondModal={this.openViewBondModal}
                openEditBondModal={this.openEditBondModal}
                openTransferBondModal={this.openTransferBondModal}
                openCloseBondModal={this.openCloseBondModal}
                recordsByPermit={this.recordsByPermit}
                activeBondCount={this.activeBondCount}
                getBalance={this.getBalance}
              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab={`Reclamation Invoices (${this.props.invoices.length})`} key="2">
            <br />
            <h4 className="uppercase">Reclamation Invoices</h4>
            <p>
              Record invoices for reclamation activities paid for with funds from confiscated bonds.
            </p>
            <br />
            <MineReclamationInvoiceTable
              isLoaded={this.state.isInvoicesLoaded}
              permits={this.props.permits}
              openAddBondModal={this.openAddBondModal}
              openAddReclamationInvoiceModal={this.openAddReclamationInvoiceModal}
              invoices={this.props.invoices}
              bonds={this.props.bonds}
              openEditReclamationInvoiceModal={this.openEditReclamationInvoiceModal}
              recordsByPermit={this.recordsByPermit}
              getBalance={this.getBalance}
              getAmountSum={this.getAmountSum}
            />
          </Tabs.TabPane>
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
  invoices: getReclamationInvoices(state),
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
      transferBond,
      fetchMineReclamationInvoices,
      createReclamationInvoice,
      updateReclamationInvoice,
    },
    dispatch
  );

MineSecurityInfo.propTypes = propTypes;
MineSecurityInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineSecurityInfo);
