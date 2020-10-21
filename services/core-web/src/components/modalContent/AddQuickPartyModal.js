import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Radio } from "antd";
import { isEmpty } from "lodash";
import { createParty } from "@common/actionCreators/partiesActionCreator";
import { getAddPartyFormState } from "@common/selectors/partiesSelectors";
import AddQuickPartyForm from "@/components/Forms/parties/AddQuickPartyForm";
import { getDropdownProvinceOptions } from "@common/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  addPartyFormState: PropTypes.objectOf(PropTypes.any),
  initialValues: PropTypes.objectOf(PropTypes.any),
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const defaultProps = {
  addPartyFormState: {
    initialValues: undefined,
  },
  initialValues: undefined,
};

export class AddQuickPartyModal extends Component {
  state = {
    isPerson: true,
    person: true,
    organization: true,
  };

  componentDidMount() {
    this.setState({
      isPerson:
        !isEmpty(this.props.addPartyFormState.initialValues) &&
        this.props.addPartyFormState.initialValues.party_type_code !== "ORG",
    });
  }

  handlePartySubmit = (values) => {
    const party_type_code = this.state.isPerson ? "PER" : "ORG";
    const payload = { party_type_code, ...values };
    this.props
      .createParty(payload)
      .then(() => {
        this.props.closeModal();
      })
      .catch();
  };

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  render = () => {
    return (
      <div>
        <div className="center">
          {this.state.person && this.state.organization && (
            <Radio.Group
              defaultValue
              size="large"
              value={this.state.isPerson}
              onChange={this.togglePartyChange}
              style={{ paddingBottom: "20px" }}
            >
              <Radio.Button value>Person</Radio.Button>
              <Radio.Button value={false}>Company</Radio.Button>
            </Radio.Group>
          )}
          <AddQuickPartyForm
            onSubmit={this.handlePartySubmit}
            isPerson={this.state.isPerson}
            initialValues={this.props.addPartyFormState.initialValues}
            showAddress
            provinceOptions={this.props.provinceOptions}
          />
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state) => ({
  addPartyFormState: getAddPartyFormState(state),
  provinceOptions: getDropdownProvinceOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createParty,
    },
    dispatch
  );

AddQuickPartyModal.propTypes = propTypes;
AddQuickPartyModal.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(AddQuickPartyModal);
