import React, { FC, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Popconfirm } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getIsModalOpen,
  getIsViewOnly,
  getProps,
  getWidth,
} from "@mds/common/redux/selectors/modalSelectors";

const CommonModalWrapper: FC = ({ children }) => {
  const dispatch = useDispatch();
  const isModalOpen = useSelector(getIsModalOpen);
  const isViewOnly = useSelector(getIsViewOnly);
  const width = useSelector(getWidth);
  const childProps = useSelector(getProps);

  const containerRef = useRef(null);

  const onBrowserButtonEvent = () => {
    dispatch(closeModal());
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

  const handleCloseModal = (event) => {
    event.preventDefault();
    dispatch(closeModal());
    // default props only shallow merged, may be undefined
    if (childProps.afterClose) {
      childProps.afterClose();
    }
  };

  return (
    <>
      {/*
        This will make sure the modal has a container 
        referenced on first render that will prevent issues with
        some libraries (e.g. leaflet)
       */}
      <div ref={containerRef}></div>

      <Modal
        width={width}
        title={childProps?.title ?? ""}
        open={isModalOpen}
        closable={false}
        footer={null}
        getContainer={() => containerRef?.current}
        destroyOnClose={true}
      >
        {isViewOnly ? (
          <Button type="text" className="modal__close" onClick={(event) => handleCloseModal(event)}>
            <CloseOutlined className="icon-sm" />
          </Button>
        ) : (
          <Popconfirm
            placement="bottomRight"
            className="modal__close"
            title="Are you sure you want to cancel?"
            okText="Yes"
            cancelText="No"
            onConfirm={(event) => handleCloseModal(event)}
          >
            <Button type="text" className="modal__close">
              <CloseOutlined className="icon-sm" />
            </Button>
          </Popconfirm>
        )}
        {children}
      </Modal>
    </>
  );
};

export default CommonModalWrapper;
