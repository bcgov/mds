/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { openModal, closeModal } from "@common/actions/modalActions";
import { fetchDraftPermitByNOW } from "@common/actionCreators/permitActionCreator";
import {
  getDraftPermitAmendmentForNOW,
  getDraftPermitForNOW,
} from "@common/selectors/permitSelectors";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE } from "@/constants/assets";

/**
 * @class NOWSecurities- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export class NOWSecurities extends Component {
  componentDidMount() {
    console.log(this.props.noticeOfWork);
    this.props.fetchDraftPermitByNOW(this.props.noticeOfWork.now_application_guid);
  }

  openDocumentModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Add Security Documents",
        onSubmit: () => {},
        permitGuid: this.props.parentPermit.permit_guid,
        mineGuid: this.props.mineGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_BOND_MODAL,
    });
  };

  render() {
    return (
      <div>
        <div className="inline-flex between">
          <h4>Securities</h4>
          <div>
            <Button type="secondary" onClick={this.openDocumentModal}>
              <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
              Add
            </Button>
          </div>
        </div>
        <p>
          Upload a copy of the security into the table below before sending the original to the
          Securities Team. All documents will be visible under securities on a mine record once the
          permit is issued.
        </p>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
  parentPermit: getDraftPermitForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ openModal, closeModal, fetchDraftPermitByNOW }, dispatch);

NOWSecurities.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NOWSecurities);
