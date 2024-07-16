import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingBar from "react-redux-loading-bar";
import CommonModalWrapper from "@mds/common/wrappers/CommonModalWrapper";
import { getProps, getContent } from "@mds/common/redux/selectors/modalSelectors";
import { closeModal } from "@mds/common/redux/actions/modalActions";

const ModalWrapper: FC = () => {
  const ChildComponent = useSelector(getContent);
  const childProps = useSelector(getProps);
  const dispatch = useDispatch();
  const dispatchCloseModal = () => dispatch(closeModal);

  return (
    <CommonModalWrapper>
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
          // TODO: this really doesn't belong here, but too many downstream effects to take out
          closeModal={dispatchCloseModal}
          {...childProps}
        />
      )}
    </CommonModalWrapper>
  );
};

export default ModalWrapper;
