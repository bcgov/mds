import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Radio } from "antd";
import { isEmpty } from "lodash";
import { createParty } from "@mds/common/redux/actionCreators/partiesActionCreator";
import { getAddPartyFormState } from "@mds/common/redux/selectors/partiesSelectors";
import AddQuickPartyForm from "@/components/Forms/parties/AddQuickPartyForm";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  addPartyFormState: PropTypes.objectOf(PropTypes.any),
  initialValues: PropTypes.objectOf(PropTypes.any),
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  afterSubmit: PropTypes.func,
};

const defaultProps = {
  addPartyFormState: {
    initialValues: undefined,
  },
  initialValues: undefined,
  afterSubmit: () => {},
};

export class AddQuickPartyModal extends Component {
  state = {
    isPerson: true,
    person: true,
    organization: true,
  };

  componentDidMount() {
    const values = !isEmpty(this.props.addPartyFormState.initialValues)
      ? this.props.addPartyFormState.initialValues
      : this.props.initialValues;
    this.setState({
      isPerson: !isEmpty(values) && values.party_type_code !== "ORG",
    });
  }

  handlePartySubmit = (values) => {
    const party_type_code = this.state.isPerson ? "PER" : "ORG";
    const payload = { party_type_code, ...values };
    let response;
    this.props
      .createParty(payload)
      .then(({ data }) => {
        response = data;
        this.props.closeModal();
      })
      .catch()
      .finally(() => {
        this.props.afterSubmit(response?.party_guid);
      });
  };

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  render = () => {
    const values = !isEmpty(this.props.addPartyFormState.initialValues)
      ? this.props.addPartyFormState.initialValues
      : this.props.initialValues;
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
              <Radio.Button value={false}>Organization</Radio.Button>
            </Radio.Group>
          )}
          <AddQuickPartyForm
            onSubmit={this.handlePartySubmit}
            isPerson={this.state.isPerson}
            initialValues={values}
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
