import React, { Component } from "react";
import { bindActionCreators } from "redux";
import LoadingBar from "react-redux-loading-bar";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal, Icon } from "antd";
import * as Styles from "@/constants/styles";
import { closeModal } from "@/actions/modalActions";
import { getIsModalOpen, getProps, getContent, getClearOnSubmit } from "@/selectors/modalSelectors";
import { AuthorizationWrapper } from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  content: PropTypes.func.isRequired,
  props: PropTypes.objectOf(PropTypes.string),
  clearOnSubmit: PropTypes.bool.isRequired,
};

const defaultProps = {
  props: {
    title: "",
  },
};

export class ModalWrapper extends Component {
  constructor(props) {
    super(props);
    // listens for browser back || forward button click and invokes function to close the modal,
    window.onpopstate = this.onBrowserButtonEvent;
  }

  onBrowserButtonEvent = () => {
    this.props.closeModal();
  };

  renderTitle = () => (
    <div className="inline-flex between">
      <h1>{this.props.props.title}</h1>
      <Icon type="close" />
    </div>
  );

  render() {
    const ChildComponent = this.props.content;
    return (
      <Modal
        title={this.props.props.title}
        visible={this.props.isModalOpen}
        closable={false}
        footer={null}
      >
        <AuthorizationWrapper inDevelopment>
          <div className="modal__close">
            <Icon type="close" />
          </div>
        </AuthorizationWrapper>
        <LoadingBar
          scope="modal"
          style={{
            position: "absolute",
            top: "50px",
            left: 0,
            backgroundColor: Styles.COLOR.violet,
            width: "100%",
            height: "8px",
            zIndex: 100,
          }}
        />
        {ChildComponent && (
          <ChildComponent
            closeModal={this.props.closeModal}
            clearOnSubmit={this.props.clearOnSubmit}
            {...this.props.props}
          />
        )}
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  isModalOpen: getIsModalOpen(state),
  props: getProps(state),
  content: getContent(state),
  clearOnSubmit: getClearOnSubmit(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      closeModal,
    },
    dispatch
  );

ModalWrapper.propTypes = propTypes;
ModalWrapper.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalWrapper);
