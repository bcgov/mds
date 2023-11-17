import React, { useState } from "react";
import PropTypes from "prop-types";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AddReportForm from "@/components/Forms/reports/AddReportForm";
import ReportHistory from "@/components/Forms/reports/ReportHistory";
import { SlidingForms } from "@/components/common/SlidingForms";
import LinkButton from "@/components/common/buttons/LinkButton";
import * as Strings from "@mds/common/constants/strings";
import AddMinePermitRequiredForm from "../Forms/reports/AddMinePermitRequiredForm";

const propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]).isRequired,
  mineGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  changeModalTitle: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  mineReportsType: PropTypes.string.isRequired,
};

const defaultProps = {
  initialValues: {},
};

export const AddReportModal = (props) => {
  const [selectedForm, setSelectedForm] = useState(0);

  const resetScrollPosition = () =>
    document.getElementsByClassName("ant-modal-wrap")[0].scrollTo(0, 0);

  const baseTitle = `${props.initialValues.submission_year} ${props.initialValues.report_name}`;

  const hideReportHistory = () => {
    resetScrollPosition();
    setSelectedForm(0);
    props.changeModalTitle(`Edit ${baseTitle}`);
  };

  const showReportHistory = () => {
    resetScrollPosition();
    setSelectedForm(1);
    props.changeModalTitle(
      <div className="ant-modal-title">
        {`File History for ${baseTitle}`}
        <br />
        <br />
        <LinkButton onClick={hideReportHistory}>
          <ArrowLeftOutlined className="padding-sm--right" />
          Back to Report
        </LinkButton>
      </div>
    );
  };
  return (
    <div>
      <SlidingForms
        selectedForm={selectedForm}
        formContent={[
          props.mineReportsType &&
          props.mineReportsType === Strings.MINE_REPORTS_TYPE.permitRequiredReports ? (
            <AddMinePermitRequiredForm
              onSubmit={props.onSubmit}
              closeModal={props.closeModal}
              title={props.title}
              mineGuid={props.mineGuid}
              initialValues={props.initialValues}
              showReportHistory={showReportHistory}
            />
          ) : (
            <AddReportForm
              onSubmit={props.onSubmit}
              closeModal={props.closeModal}
              title={props.title}
              mineGuid={props.mineGuid}
              initialValues={props.initialValues}
              showReportHistory={showReportHistory}
            />
          ),
          props.initialValues.mine_report_submissions && (
            <ReportHistory
              hideReportHistory={hideReportHistory}
              mineReportSubmissions={props.initialValues.mine_report_submissions}
              submissionYear={props.initialValues.submission_year}
              mineReportDefinitionGuid={props.initialValues.mine_report_definition_guid}
            />
          ),
        ]}
      />
    </div>
  );
};

AddReportModal.propTypes = propTypes;
AddReportModal.defaultProps = defaultProps;

export default AddReportModal;
