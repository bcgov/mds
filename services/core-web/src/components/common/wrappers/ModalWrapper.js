import React, { useEffect } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal, Button, Popconfirm } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { closeModal } from "@common/actions/modalActions";
import {
  getIsModalOpen,
  getProps,
  getContent,
  getClearOnSubmit,
  getWidth,
  getIsViewOnly,
} from "@common/selectors/modalSelectors";
import LoadingBar from "react-redux-loading-bar";
import * as Styles from "@/constants/styles";
import AddPartyComponentWrapper from "./AddPartyComponentWrapper";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  content: PropTypes.func,
  props: PropTypes.objectOf(PropTypes.any),
  clearOnSubmit: PropTypes.bool.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isViewOnly: PropTypes.bool.isRequired,
};

const defaultProps = {
  props: {
    title: "",
    onSubmit: () => {},
    afterClose: () => {},
  },
  content: () => {},
};

export const ModalWrapper = (props) => {
  const {
    props: childProps,
    closeModal: handleCloseModal,
    isModalOpen,
    isViewOnly,
    width,
    clearOnSubmit,
    content,
  } = props;

  const onBrowserButtonEvent = () => {
    handleCloseModal();
  };

  // listens for browser back || forward button click and invokes function to close the modal
  window.onpopstate = onBrowserButtonEvent;

  useEffect(() => {
    // disable background scroll when there is a modal open
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen]);

  const closeModal = (event) => {
    event.preventDefault();
    handleCloseModal();
    // default props only shallow merged, may be undefined
    if (childProps.afterClose) {
      childProps.afterClose();
    }
  };

  return (
    <Modal
      width={width}
      title={childProps.title}
      visible={isModalOpen}
      closable={false}
      footer={null}
    >
      {isViewOnly ? (
        <Button ghost className="modal__close" onClick={(event) => closeModal(event)}>
          <CloseOutlined className="icon-sm" />
        </Button>
      ) : (
        <Popconfirm
          placement="bottomRight"
          title="Are you sure you want to cancel?"
          okText="Yes"
          cancelText="No"
          onConfirm={(event) => closeModal(event)}
        >
          <Button ghost className="modal__close">
            <CloseOutlined className="icon-sm" />
          </Button>
        </Popconfirm>
      )}
      <LoadingBar
        scope="modal"
        style={{
          position: "absolute",
          top: "54px",
          left: 0,
          backgroundColor: Styles.COLOR.violet,
          height: "3px",
          zIndex: 100,
        }}
      />
      {content && (
        <AddPartyComponentWrapper
          closeModal={handleCloseModal}
          clearOnSubmit={clearOnSubmit}
          content={content}
          childProps={childProps}
        />
      )}
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  width: getWidth(state),
  isModalOpen: getIsModalOpen(state),
  props: getProps(state),
  content: getContent(state),
  clearOnSubmit: getClearOnSubmit(state),
  isViewOnly: getIsViewOnly(state),
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
