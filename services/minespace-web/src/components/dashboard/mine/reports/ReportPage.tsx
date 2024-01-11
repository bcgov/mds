import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import ReportDetailsForm from "@mds/common/components/reports/ReportDetailsForm";
import { fetchMineReport } from "@mds/common/redux/actionCreators/reportActionCreator";
import { getMineReportById } from "@mds/common/redux/reducers/reportReducer";

const ReportPage = () => {
  const dispatch = useDispatch();
  const { mineGuid, reportGuid } = useParams<{ mineGuid: string; reportGuid: string }>();
  console.log(mineGuid, reportGuid);
  const mineReport = useSelector((state) => getMineReportById(state, reportGuid));
  const [loaded, setIsLoaded] = useState(mineReport);
  console.log("mineReport", mineReport);

  useEffect(() => {
    let isMounted = true;
    if (!mineReport) {
      dispatch(fetchMineReport(mineGuid, reportGuid)).then((r) => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });
    }
    return () => (isMounted = false);
  }, [reportGuid]);

  return (
    <ReportDetailsForm
      mineGuid={mineGuid}
      handleSubmit={(values) => console.log(values)}
      isEditMode={false}
      formButtons={null}
    />
  );
};

export default ReportPage;
