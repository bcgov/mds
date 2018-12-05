import React, { Component } from "react";
import { Radio } from "antd";
import PropTypes from "prop-types";
import UpdatePermitteeForm from "@/components/Forms/UpdatePermitteeForm";
import AddPartyForm from "@/components/Forms/AddPartyForm";
import * as ModalContent from "@/constants/modalContent";
import { connect } from "react-redux";
import { getCurrentPermitteeIds, getCurrentPermittees } from "@/selectors/mineSelectors";
import { getParties, getPartyIds } from "@/selectors/partiesSelectors";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  permit: PropTypes.object.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
  permittees: PropTypes.object.isRequired,
  permitteeIds: PropTypes.array.isRequired,
};

const defaultProps = {
  permit: {},
  parties: {},
  partyIds: [],
  permitteeIds: [],
  permittees: {},
};

export class UpdatePermitteeModal extends Component {
  state = { isPerson: true };

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  handlePartySubmit = (values) => {
    const type = this.state.isPerson ? "PER" : "ORG";
    this.props.handlePartySubmit(values, type);
  };

  render() {
    return (
      <div>
        <UpdatePermitteeForm {...this.props} />
        <p className="center">{ModalContent.PARTY_NOT_FOUND}</p>
        <div className="center">
          <Radio.Group defaultValue size="large" onChange={this.togglePartyChange}>
            <Radio.Button value>Person</Radio.Button>
            <Radio.Button value={false}>Company</Radio.Button>
          </Radio.Group>
          <AddPartyForm onSubmit={this.handlePartySubmit} isPerson={this.state.isPerson} />
        </div>
      </div>
    );
  }
}

UpdatePermitteeModal.propTypes = propTypes;
UpdatePermitteeModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  parties: getParties(state),
  partyIds: getPartyIds(state),
  permittees: getCurrentPermittees(state),
  permitteeIds: getCurrentPermitteeIds(state),
});

export default connect(
  mapStateToProps,
  null
)(UpdatePermitteeModal);
