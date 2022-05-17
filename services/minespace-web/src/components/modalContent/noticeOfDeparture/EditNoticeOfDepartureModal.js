import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import EditNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/EditNoticeOfDepartureForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  afterClose: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
};

const AddNoticeOfDepartureModal = (props) => {
  const { onSubmit, initialValues, afterClose, closeModal, mineGuid, noticeOfDeparture } = props;

  const close = () => {
    closeModal();
    afterClose();
  };

  return (
    <div>
      <EditNoticeOfDepartureForm
        initialValues={initialValues}
        mineGuid={mineGuid}
        onSubmit={onSubmit}
        closeModal={close}
        noticeOfDeparture={noticeOfDeparture}
      />
    </div>
  );
};
//
// const mapStateToProps = (state) => ({
//   editNoticeOfDepartureFormValues: getFormValues(FORM.EDIT_NOTICE_OF_DEPARTURE)(state) || {},
// });

AddNoticeOfDepartureModal.propTypes = propTypes;

export default AddNoticeOfDepartureModal;
