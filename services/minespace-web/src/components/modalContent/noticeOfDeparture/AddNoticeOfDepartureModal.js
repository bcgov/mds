import React from "react";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import PropTypes from "prop-types";
import * as FORM from "@/constants/forms";
import AddNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/AddNoticeOfDepartureForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  afterClose: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const AddNoticeOfDepartureModal = (props) => {
  const { onSubmit, initialValues, afterClose, closeModal, mineGuid, permits } = props;

  const close = () => {
    closeModal();
    afterClose();
  };

  return (
    <div>
      <AddNoticeOfDepartureForm
        initialValues={initialValues}
        permits={permits}
        mineManagerOptions={[]}
        mineGuid={mineGuid}
        onSubmit={onSubmit}
        closeModal={close}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  addNoticeOfDepartureFormValues: getFormValues(FORM.ADD_NOTICE_OF_DEPARTURE)(state) || {},
});

AddNoticeOfDepartureModal.propTypes = propTypes;

export default connect(mapStateToProps)(AddNoticeOfDepartureModal);
