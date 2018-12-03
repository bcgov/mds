import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card } from "antd";
import ConditionalButton from "@/components/common/ConditionalButton";
import { modalConfig } from "@/components/modalContent/config";
import * as String from "@/constants/strings";
import * as ModalContent from "@/constants/modalContent";

const propTypes = {
  /*     closeModal: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handlePartySubmit: PropTypes.func.isRequired,
    fetchMineRecordById: PropTypes.func.isRequired,
    fetchParties: PropTypes.func.isRequired,
    addPermittee: PropTypes.func.isRequired,
    mine: PropTypes.object.isRequired,
    permittees: PropTypes.object,
    permitteeIds: PropTypes.array */
};

const defaultProps = {
  /*     mine: {},
    permittees: {},
    permitteeIds: [], */
};

export class ViewPermittee extends Component {
  render() {
    const {
      /* permittees, permitteeIds, mine */
    } = this.props;

    return <div>Test</div>;
  }
}

ViewPermittee.propTypes = propTypes;
ViewPermittee.defaultProps = defaultProps;

export default ViewPermittee;
