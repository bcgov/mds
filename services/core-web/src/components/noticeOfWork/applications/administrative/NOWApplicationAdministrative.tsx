import React, { FC } from "react";
import { useAppSelector } from "@mds/common/redux/rootState";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { IGroupedDropdownList, INoticeOfWork, IOption } from "@mds/common/interfaces";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import NOWSecurities from "@/components/noticeOfWork/applications/administrative/NOWSecurities";
import NOWDocuments from "@/components/noticeOfWork/applications/NOWDocuments";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import AssignInspectors from "@/components/noticeOfWork/applications/verification/AssignInspectors";
import AssignTier from "@/components/noticeOfWork/applications/verification/AssignTier";
import NOWProgressTable from "@/components/noticeOfWork/applications/administrative/NOWProgressTable";

/**
 * @constant NOWApplicationAdministrative contains the securities, inspector, tier and progress
 * tracking sections of a Notice of Work Application. Application documents are managed on the
 * Manage Documents tab.
 */

export interface NOWApplicationAdministrativeProps {
  inspectors: (IOption | IGroupedDropdownList)[];
  consultationAdvisors: (IOption | IGroupedDropdownList)[];
  handleUpdateInspectors: (values: any, callback?: () => void) => void | Promise<any>;
  handleUpdateTier: (values: any, callback?: () => void) => void | Promise<any>;
  isLoaded: boolean;
}

export const NOWApplicationAdministrative: FC<NOWApplicationAdministrativeProps> = ({
  inspectors,
  consultationAdvisors,
  handleUpdateInspectors,
  handleUpdateTier,
  isLoaded,
}) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const noticeOfWork: INoticeOfWork = useAppSelector(getNoticeOfWork);
  const isExploration =
    noticeOfWork.notice_of_work_type_code === "MIN" ||
    noticeOfWork.notice_of_work_type_code === "COL";

  return (
    <div>
      <ScrollContentWrapper
        id="reclamation-securities"
        title="Reclamation Securities"
        isLoaded={isLoaded}
      >
        <NOWSecurities />
        <br />
        <br />
        <NOWDocuments
          documents={(noticeOfWork.documents ?? []).filter(
            ({ now_application_document_sub_type_code }) =>
              now_application_document_sub_type_code === "SDO"
          )}
          isViewMode={false}
          isAdminView
          allowAfterProcess
          isStandardDocuments
          disclaimerText="Upload securities-related files here."
          categoriesToShow={["SDO"]}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="inspectors" title="Inspectors" isLoaded={isLoaded}>
        <AssignInspectors
          inspectors={inspectors}
          consultationAdvisors={consultationAdvisors}
          noticeOfWork={noticeOfWork}
          handleUpdateInspectors={handleUpdateInspectors}
          title="Update Inspectors"
          isAdminView
          isLoaded={isLoaded}
        />
      </ScrollContentWrapper>
      {isFeatureEnabled(Feature.NOTICE_OF_WORK_TIER) && isExploration && (
        <ScrollContentWrapper id="tier-category" title="Tier Category" isLoaded={isLoaded}>
          <AssignTier
            noticeOfWork={noticeOfWork}
            handleUpdateTier={handleUpdateTier}
            title="Update Tier Category"
            isAdminView
            isLoaded={isLoaded}
          />
        </ScrollContentWrapper>
      )}
      <ScrollContentWrapper
        id="progress-tracking"
        title="Application Progress Tracking"
        isLoaded={isLoaded}
      >
        <NOWProgressTable />
      </ScrollContentWrapper>
    </div>
  );
};

export default NOWApplicationAdministrative;
