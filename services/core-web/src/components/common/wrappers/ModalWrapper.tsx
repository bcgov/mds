import React, { FC } from "react";
import { useSelector } from "react-redux";
import CommonModalWrapper from "@mds/common/wrappers/CommonModalWrapper";
import { getContent, getProps } from "@mds/common/redux/selectors/modalSelectors";
import AddPartyComponentWrapper from "./AddPartyComponentWrapper";

const ModalWrapper: FC = () => {
  const content = useSelector(getContent);
  const childProps = useSelector(getProps);

  return (
    <CommonModalWrapper>
      {content && <AddPartyComponentWrapper content={content} childProps={childProps} />}
    </CommonModalWrapper>
  );
};

export default ModalWrapper;
