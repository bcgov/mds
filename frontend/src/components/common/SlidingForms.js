import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
// Ant design Carousel is based on react-slick and kind of sucks. Tabbing breaks it, dynamically rendering content breaks it,
// and you need to use Refs to interact with it for a number of features. Brought in react-responsive-carousel instead.
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Icon } from "antd";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  formContent: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedForm: PropTypes.number.isRequired,
};

export class SlidingForms extends Component {
  componentWillReceiveProps = (nextProps) => {
    if (this.props.selectedForm !== nextProps.selectedForm) {
      this.toggleSelectedForm();
    }
  };

  toggleSelectedForm = () => {
    document.activeElement.blur();
  };

  renderWrappedForm = () => (
    <div>
      <LinkButton>
        <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
        Back
      </LinkButton>
    </div>
  );

  render = () => (
    <div>
      <Carousel
        selectedItem={this.props.selectedForm}
        showArrows={false}
        showStatus={false}
        showIndicators={false}
        showThumbs={false}
        swipeable={false}
      >
        {this.props.formContent.map((form, index) => {
          return (
            <div style={this.props.selectedForm !== index ? { display: "none" } : {}}>
              <div className="fade-in">{form}</div>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

SlidingForms.propTypes = propTypes;

export default connect(mapDispatchToProps)(SlidingForms);
