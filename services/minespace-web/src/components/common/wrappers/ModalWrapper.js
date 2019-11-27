import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "antd";
import LoadingBar from "react-redux-loading-bar";
import { closeModal } from "@/actions/modalActions";
import { getIsModalOpen, getProps, getContent, getClearOnSubmit } from "@/selectors/modalSelectors";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  content: PropTypes.func,
  clearOnSubmit: PropTypes.bool.isRequired,
};

const defaultProps = {
  content: () => {},
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

  render() {
    const ChildComponent = this.props.content;
    return (
      <Modal
        width={810}
        title={this.props.props.title}
        visible={this.props.isModalOpen}
        closable={false}
        footer={null}
      >
        <LoadingBar
          scope="modal"
          style={{
            position: "absolute",
            top: "50px",
            left: 0,
            backgroundColor: "#6b6363",
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
