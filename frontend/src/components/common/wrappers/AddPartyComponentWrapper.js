import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
// Ant design Carousel is based on react-slick and kind of sucks. Tabbing breaks it, dynamically rendering content breaks it,
// and you need to use Refs to interact with it for a number of features. Brought in react-responsive-carousel instead.
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Radio, Icon, Divider } from "antd";
import AddQuickPartyForm from "@/components/Forms/parties/AddQuickPartyForm";
import { createParty, setAddPartyFormState } from "@/actionCreators/partiesActionCreator";
import { getAddPartyFormState } from "@/selectors/partiesSelectors";

const propTypes = {
  childProps: PropTypes.objectOf(PropTypes.string),
  content: PropTypes.func,
  clearOnSubmit: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  setAddPartyFormState: PropTypes.func.isRequired,
  addPartyFormState: PropTypes.objectOf(
    PropTypes.shape({
      showingAddPartyForm: PropTypes.bool,
      person: PropTypes.bool,
      organization: PropTypes.bool,
      partyLabel: PropTypes.string,
    })
  ).isRequired,
};

const defaultProps = {
  childProps: {
    title: "",
  },
  content: () => {},
};

const defaultAddPartyFormState = {
  showingAddPartyForm: false,
  person: true,
  organization: true,
  partyLabel: "contact",
};

export class AddPartyComponentWrapper extends Component {
  state = { isPerson: true, addingParty: false };

  componentWillMount = () => {
    this.resetAddPartyForm();
  };

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
    this.props.setAddPartyFormState(defaultAddPartyFormState);
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
      <a
        role="link"
        onClick={this.resetAddPartyForm}
        // Accessibility: Event listener
        onKeyPress={this.resetAddPartyForm}
        // Accessibility: Focusable element
        tabIndex="0"
      >
        <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
        Back to: {this.props.childProps.title}
      </a>
      <Divider />
      <div className="center">
        {this.props.addPartyFormState.person && this.props.addPartyFormState.organization && (
          <Radio.Group
            defaultValue
            size="large"
            value={this.props.isPerson}
            onChange={this.togglePartyChange}
          >
            <Radio.Button value>Person</Radio.Button>
            <Radio.Button value={false}>Company</Radio.Button>
          </Radio.Group>
        )}
        <br />
        <br />
        <AddQuickPartyForm onSubmit={this.handlePartySubmit} isPerson={this.state.isPerson} />
      </div>
    </div>
  );

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

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
          <div style={this.state.addingParty ? { display: "none" } : {}}>
            {ChildComponent && (
              <ChildComponent
                closeModal={this.props.closeModal}
                clearOnSubmit={this.props.clearOnSubmit}
                {...this.props.childProps}
              />
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPartyComponentWrapper);
