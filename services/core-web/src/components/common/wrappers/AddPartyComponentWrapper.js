import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Radio, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
// Ant design Carousel is based on react-slick and kind of sucks. Tabbing breaks it, dynamically rendering content breaks it,
// and you need to use Refs to interact with it for a number of features. Brought in react-responsive-carousel instead.
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { createParty, setAddPartyFormState } from "@common/actionCreators/partiesActionCreator";
import { getAddPartyFormState } from "@common/selectors/partiesSelectors";
import AddQuickPartyForm from "@/components/Forms/parties/AddQuickPartyForm";
import { getDropdownProvinceOptions } from "@common/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "../buttons/LinkButton";

const propTypes = {
  childProps: PropTypes.objectOf(PropTypes.any),
  content: PropTypes.func,
  clearOnSubmit: PropTypes.bool.isRequired,
  closeModal: PropTypes.func,
  createParty: PropTypes.func.isRequired,
  setAddPartyFormState: PropTypes.func.isRequired,
  // addPartyFormState is selected from the partiesReducer
  addPartyFormState: PropTypes.objectOf(PropTypes.any).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const defaultProps = {
  childProps: {
    title: "",
  },
  closeModal: () => {},
  content: () => {},
  initialValues: {},
};

const defaultAddPartyFormState = {
  showingAddPartyForm: false,
  person: true,
  organization: true,
  partyLabel: "contact",
};

export class AddPartyComponentWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = { isPerson: true, addingParty: false };
    this.resetAddPartyForm();
  }

  componentWillReceiveProps = (nextProps) => {
    if (
      nextProps.addPartyFormState.showingAddPartyForm &&
      this.props.addPartyFormState.showingAddPartyForm !==
        nextProps.addPartyFormState.showingAddPartyForm
    ) {
      this.showAddPartyForm();
    } else {
      this.hideAddPartyForm();
    }
  };

  resetAddPartyForm = () => {
    this.props.setAddPartyFormState({
      ...this.props.addPartyFormState,
      ...defaultAddPartyFormState,
    });
  };

  showAddPartyForm = () => {
    // If focus remains active in the parent form, Carousel behavior breaks.
    document.activeElement.blur();
    this.setState({ addingParty: true });
  };

  hideAddPartyForm = () => {
    // If focus remains active in the party form, Carousel behavior breaks.
    document.activeElement.blur();
    this.setState({ addingParty: false });
  };

  handlePartySubmit = (values) => {
    const party_type_code = this.state.isPerson ? "PER" : "ORG";
    const payload = { party_type_code, ...values };
    this.props
      .createParty(payload)
      .then(() => {
        this.resetAddPartyForm();
      })
      .catch();
  };

  renderAddParty = () => (
    <div>
      <h2>Add new {this.props.addPartyFormState.partyLabel}</h2>
      <LinkButton onClick={this.resetAddPartyForm}>
        <ArrowLeftOutlined className="padding-sm--right" />
        Back to: {this.props.childProps.title}
      </LinkButton>
      <Divider />
      <div className="center">
        {this.props.addPartyFormState.person && this.props.addPartyFormState.organization && (
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
          provinceOptions={this.props.provinceOptions}
        />
      </div>
    </div>
  );

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  // eslint-disable-next-line react/require-render-return
  render = () => {
    const ChildComponent = this.props.content;
    return (
      <div>
        <Carousel
          selectedItem={this.state.addingParty ? 1 : 0}
          showArrows={false}
          showStatus={false}
          showIndicators={false}
          showThumbs={false}
          swipeable={false}
        >
          {/* Set original form to display:none to preserve its state, while not allowing any interaction such as tabbing to the hidden form. */}
          <div style={this.state.addingParty ? { display: "none" } : {}}>
            {ChildComponent && (
              <div className="fade-in">
                <ChildComponent
                  closeModal={this.props.closeModal}
                  clearOnSubmit={this.props.clearOnSubmit}
                  {...this.props.childProps}
                />
              </div>
            )}
          </div>
          <div>{this.state.addingParty && this.renderAddParty()}</div>
        </Carousel>
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
      setAddPartyFormState,
    },
    dispatch
  );

AddPartyComponentWrapper.propTypes = propTypes;
AddPartyComponentWrapper.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(AddPartyComponentWrapper);
