import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "antd";
import LoadingBar from "react-redux-loading-bar";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getIsModalOpen,
  getProps,
  getContent,
  getClearOnSubmit,
  getWidth,
} from "@mds/common/redux/selectors/modalSelectors";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  clearOnSubmit: PropTypes.bool.isRequired,
  content: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  props: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  content: () => {},
  props: {
    title: "",
    onSubmit: () => {},
  },
};

export class ModalWrapper extends Component {
  constructor(props) {
    super(props);
    // Closes modal on browser forward/back actions
    window.onpopstate = this.onBrowserButtonEvent;
    this.containerRef = React.createRef();
  }

  onBrowserButtonEvent = () => {
    this.props.closeModal();
  };

  render() {
    const ChildComponent = this.props.content;
    return (
      <>
        {/*
          This will make sure the modal has a container 
          referenced on first render that will prevent issues with
          some libraries (e.g. leaflet)
         */}
        <div ref={this.containerRef}></div>
        <Modal
          title={this.props.props.title}
          open={this.props.isModalOpen}
          width={this.props.width}
          footer={null}
          closable={false}
          getContainer={() => this.containerRef?.current}
          destroyOnClose={true}
        >
          <LoadingBar
            scope="modal"
            className="color-primary"
            style={{
              position: "absolute",
              top: "50px",
              left: 0,
              width: "100%",
              height: "8px",
              zIndex: 1001,
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
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  isModalOpen: getIsModalOpen(state),
  props: getProps(state),
  content: getContent(state),
  clearOnSubmit: getClearOnSubmit(state),
  width: getWidth(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(ModalWrapper);
