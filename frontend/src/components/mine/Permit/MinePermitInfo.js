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
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
};

export class MinePermitInfo extends Component {
  state = { expandedRowKeys: [] };

  componentWillMount = () => {
    this.props.fetchPermits({ mine_guid: this.props.mine.mine_guid });
  };

  componentWillReceiveProps = (nextProps) => {
    if (this.props.permits.length > 0) {
      const currentPermits = this.props.permits.map((x) => x.permit_guid);
      const nextPermits = nextProps.permits.map((x) => x.permit_guid);
      this.setState({
        expandedRowKeys: nextPermits.filter((key) => currentPermits.indexOf(key) === -1),
      });
    }
  };

  closePermitModal = () => {
    this.props.closeModal();
    this.props.fetchPermits({ mine_guid: this.props.mine.mine_guid });
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
    const payload = { mine_guid: this.props.mine.mine_guid, ...values };

    payload.permit_no = `${values.permit_type}${values.permit_activity_type || ""}-${
      values.permit_no
    }`;

    return this.props.createPermit(payload).then(this.closePermitModal);
  };

  handleEditPermit = (values) =>
    this.props.updatePermit(values.permit_guid, values).then(this.closePermitModal);

  // Amendment Modals

  openAddAmendmentModal = (event, onSubmit, title, permit, type) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: permit.mine_guid,
          permit_guid: permit.permit_guid,
          permit_amendment_type_code: type,
          amendments: permit.amendments,
        },
        onSubmit,
        title,
        mine_guid: permit.mine_guid,
        amendments: permit.amendments,
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
          amendments: permit.amendments,
        },
        onSubmit: this.handleEditPermitAmendment,
        title:
          permit_amendment.permit_amendment_type_code === originalPermit
            ? `Edit initial permit for ${permit.permit_no}`
            : `Edit permit amendment for ${permit.permit_no}`,
        mine_guid: permit.mine_guid,
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
      .updatePermitAmendment(values.permit_amendment_guid, values)
      .then(this.closePermitModal);

  handleAddPermitAmendment = (values) =>
    this.props.createPermitAmendment(values.permit_guid, values).then(this.closePermitModal);

  handleAddAmalgamatedPermit = (values) =>
    this.props
      .createPermitAmendment(values.permit_guid, {
        ...values,
        permit_amendment_type_code: amalgamtedPermit,
      })
      .then(this.closePermitModal);

  handleRemovePermitAmendmentDocument = (permitAmdendmentGuid, documentGuid) =>
    this.props.removePermitAmendmentDocument(permitAmdendmentGuid, documentGuid).then(() => {
      this.props.fetchPermits({ mine_guid: this.props.mine.mine_guid });
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
              permission={Permission.CREATE}
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
    },
    dispatch
  );

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MinePermitInfo);
