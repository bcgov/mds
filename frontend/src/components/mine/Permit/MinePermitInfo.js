import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  fetchPermits,
  createPermit,
  updatePermit,
  updatePermitAmendment,
  createPermitAmendment,
  removePermitAmendmentDocument,
} from "@/actionCreators/permitActionCreator";
import { fetchPartyRelationships } from "@/actionCreators/partiesActionCreator";
import { fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import AddButton from "@/components/common/AddButton";
import MinePermitTable from "@/components/mine/Permit/MinePermitTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { getPermits } from "../../../reducers/permitReducer";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const amalgamtedPermit = "ALG";
const originalPermit = "OGP";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  fetchPartyRelationships: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createPermit: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  updatePermit: PropTypes.func.isRequired,
  updatePermitAmendment: PropTypes.func.isRequired,
  createPermitAmendment: PropTypes.func.isRequired,
  removePermitAmendmentDocument: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
};

export class MinePermitInfo extends Component {
  state = { expandedRowKeys: [], modifiedPermits: false, modifiedPermitGuid: null };

  componentWillMount = () => {
    this.props.fetchPermits(this.props.mine.mine_guid);
  };

  componentWillReceiveProps = (nextProps) => {
    if (this.state.modifiedPermits && nextProps.permits !== this.props.permits) {
      const currentPermits = this.props.permits
        .filter((p) => p.mine_guid === this.props.mine.mine_guid)
        .map((x) => x.permit_guid);
      const nextPermits = nextProps.permits
        .filter((p) => p.mine_guid === this.props.mine.mine_guid)
        .map((x) => x.permit_guid);

      this.setState((prevState) => ({
        expandedRowKeys: prevState.modifiedPermitGuid
          ? [prevState.modifiedPermitGuid]
          : nextPermits.filter((key) => currentPermits.indexOf(key) === -1),
        modifiedPermitGuid: null,
      }));
    }
  };

  closePermitModal = () => {
    this.props.closeModal();
    this.props.fetchMineRecordById(this.props.mine.mine_guid);
    this.props.fetchPermits(this.props.mine.mine_guid);
    this.props.fetchPartyRelationships({
      mine_guid: this.props.mine.mine_guid,
      relationships: "party",
    });
  };

  // Permit Modals

  openAddPermitModal = (event, onSubmit, title) => {
    event.preventDefault();

    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: this.props.mine.mine_guid,
        },
        onSubmit,
        title,
        mine_guid: this.props.mine.mine_guid,
      },
      widthSize: "50vw",
      content: modalConfig.ADD_PERMIT,
    });
  };

  openEditPermitModal = (event, permit) => {
    event.preventDefault();

    this.props.openModal({
      props: {
        initialValues: permit,
        onSubmit: this.handleEditPermit,
        title: `Edit permit status for ${permit.permit_no}`,
      },
      content: modalConfig.EDIT_PERMIT,
    });
  };

  // Permit Handlers

  handleAddPermit = (values) => {
    const payload = { ...values };

    payload.permit_no = `${values.permit_type}${values.permit_activity_type || ""}-${
      values.permit_no
    }`;

    this.setState({ modifiedPermits: true });

    return this.props.createPermit(this.props.mine.mine_guid, payload).then(this.closePermitModal);
  };

  handleEditPermit = (values) =>
    this.props
      .updatePermit(this.props.mine.mine_guid, values.permit_guid, values)
      .then(this.closePermitModal);

  // Amendment Modals

  openAddAmendmentModal = (event, onSubmit, title, permit, type) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: permit.mine_guid,
          permit_guid: permit.permit_guid,
          permit_amendment_type_code: type,
          amendments: permit.permit_amendments,
        },
        onSubmit,
        title,
        mine_guid: permit.mine_guid,
        amendments: permit.permit_amendments,
      },
      widthSize: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  openEditAmendmentModal = (event, permit_amendment, permit) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          ...permit_amendment,
          amendments: permit.permit_amendments,
        },
        onSubmit: this.handleEditPermitAmendment,
        title:
          permit_amendment.permit_amendment_type_code === originalPermit
            ? `Edit initial permit for ${permit.permit_no}`
            : `Edit permit amendment for ${permit.permit_no}`,
        mine_guid: permit.mine_guid,
        permit_guid: permit.permit_guid,
        handleRemovePermitAmendmentDocument: this.handleRemovePermitAmendmentDocument,
      },
      widthSize: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  openAddAmalgamatedPermitModal = (event, permit) =>
    this.openAddAmendmentModal(
      event,
      this.handleAddAmalgamatedPermit,
      `Add amalgamated permit to ${permit.permit_no}`,
      permit,
      amalgamtedPermit
    );

  openAddPermitAmendmentModal = (event, permit) =>
    this.openAddAmendmentModal(
      event,
      this.handleAddPermitAmendment,
      `Add permit amendment to ${permit.permit_no}`,
      permit
    );

  // Amendment Handlers

  handleEditPermitAmendment = (values) =>
    this.props
      .updatePermitAmendment(
        this.props.mine.mine_guid,
        values.permit_guid,
        values.permit_amendment_guid,
        values
      )
      .then(this.closePermitModal);

  handleAddPermitAmendment = (values) => {
    this.setState({ modifiedPermits: true, modifiedPermitGuid: values.permit_guid });
    return this.props
      .createPermitAmendment(this.props.mine.mine_guid, values.permit_guid, values)
      .then(this.closePermitModal);
  };

  handleAddAmalgamatedPermit = (values) => {
    this.setState({ modifiedPermits: true, modifiedPermitGuid: values.permit_guid });
    return this.props
      .createPermitAmendment(this.props.mine.mine_guid, values.permit_guid, {
        ...values,
        permit_amendment_type_code: amalgamtedPermit,
      })
      .then(this.closePermitModal);
  };

  handleRemovePermitAmendmentDocument = (permitGuid, permitAmdendmentGuid, documentGuid) =>
    this.props
      .removePermitAmendmentDocument(
        this.props.mine.mine_guid,
        permitGuid,
        permitAmdendmentGuid,
        documentGuid
      )
      .then(() => {
        this.props.fetchPermits(this.props.mine.mine_guid);
      });

  onExpand = (expanded, record) =>
    this.setState((prevState) => {
      const expandedRowKeys = expanded
        ? prevState.expandedRowKeys.concat(record.key)
        : prevState.expandedRowKeys.filter((key) => key !== record.key);
      return { expandedRowKeys };
    });

  render() {
    return [
      <div>
        <div className="inline-flex between">
          <div />
          <div className="inline-flex between">
            <AuthorizationWrapper
              permission={Permission.EDIT_PERMITS}
              isMajorMine={this.props.mine.major_mine_ind}
            >
              <AddButton
                onClick={(event) =>
                  this.openAddPermitModal(
                    event,
                    this.handleAddPermit,
                    `${ModalContent.ADD_PERMIT} to ${this.props.mine.mine_name}`
                  )
                }
              >
                Add a New Permit
              </AddButton>
            </AuthorizationWrapper>
          </div>
        </div>
      </div>,
      <br />,
      this.props.permits && (
        <MinePermitTable
          permits={this.props.permits}
          partyRelationships={this.props.partyRelationships}
          major_mine_ind={this.props.mine.major_mine_ind}
          openEditPermitModal={this.openEditPermitModal}
          openEditAmendmentModal={this.openEditAmendmentModal}
          openAddPermitAmendmentModal={this.openAddPermitAmendmentModal}
          openAddAmalgamatedPermitModal={this.openAddAmalgamatedPermitModal}
          expandedRowKeys={this.state.expandedRowKeys}
          onExpand={this.onExpand}
        />
      ),
    ];
  }
}

const mapStateToProps = (state) => ({
  permits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPermits,
      createPermit,
      updatePermit,
      updatePermitAmendment,
      createPermitAmendment,
      removePermitAmendmentDocument,
      fetchPartyRelationships,
      fetchMineRecordById,
    },
    dispatch
  );

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MinePermitInfo);
