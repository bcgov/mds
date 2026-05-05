import React, { FC, useEffect, useState } from "react";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import AddButton from "@/components/common/buttons/AddButton";
import NOWApplicationReviewsTable from "@/components/noticeOfWork/applications/referals/NOWApplicationReviewsTable";
import NOWConsultationNationsTable from "./NOWConsultationNationsTable";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import { CONSULTATION_TAB_CODE } from "@/constants/NOWConditions";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import { INoticeOfWorkApplicationReview, IOption, IGroupedDropdownList } from "@mds/common/interfaces";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { useParams } from "react-router-dom";
import { getDropdownNoticeOfWorkNationEventOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { getPipConsultationData, getNoticeOfWorkNations } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  fetchNoticeOfWorkApplicationNations,
  createNoticeOfWorkApplicationNation,
  deleteNoticeOfWorkApplicationNation,
  createNoticeOfWorkApplicationNationEvent,
  fetchPipConsultationAreaData,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { createDropDownList } from "@common/utils/helpers";
import { NOW_APPLICATION_NATION_STATUS_CODE } from "@mds/common/constants/enums";
import { USER_ROLES } from "@mds/common/constants/environment";
import { getLatestEvent } from "@common/utils/helpers";

/**
 * @constant Consultation renders edit/view for the Consultation step
 */

interface ConsultationProps {
  noticeOfWorkReviews: INoticeOfWorkApplicationReview[];
  noticeOfWorkReviewTypes: (IOption | IGroupedDropdownList)[];
  isLoaded: boolean;
  handleDelete: (record: any) => void;
  openEditModal: (...args: any[]) => void;
  handleEdit: (...args: any[]) => void;
  handleDocumentDelete: (...args: any[]) => void;
  openAddReviewModal: (...args: any[]) => void;
  handleAddReview: (...args: any[]) => void;
}

const categoriesToShow = ["CDO"];
export const Consultation: FC<ConsultationProps> = (props) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const { isFeatureEnabled } = useFeatureFlag();
  const isNoticeOfWorkNationsEnabled = isFeatureEnabled(Feature.NOTICE_OF_WORK_NATIONS);
  const userCanManageConsultationAdvisor = useAppSelector(userHasRole(USER_ROLES.role_manage_consultation_advisor));
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const noticeOfWorkNationEventOptions = useAppSelector(getDropdownNoticeOfWorkNationEventOptions);
  const pipConsultationAreas = useAppSelector(getPipConsultationData);
  const nations = useAppSelector(getNoticeOfWorkNations);
  const pipConsultationAreaOptions = createDropDownList(
    pipConsultationAreas,
    "contact_organization_name",
    "internal_mds_id"
  );

  const onExpand = (expanded, record) =>
    setExpandedRowKeys((prevState) =>
      expanded ? prevState.concat(record.key) : prevState.filter((key) => key !== record.key)
    );

  useEffect(() => {
    if (isNoticeOfWorkNationsEnabled) {
      dispatch(fetchPipConsultationAreaData());
      dispatch(fetchNoticeOfWorkApplicationNations(id));
    }
  }, [isNoticeOfWorkNationsEnabled]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleAddNation = (values) => {
    const selectedPipArea = pipConsultationAreas.find(
      (area) => area?.internal_mds_id === values?.pip_consultation_area
    );

    const payload = {
      now_application_nation_status_code: NOW_APPLICATION_NATION_STATUS_CODE.NOS,
      due_date: values?.due_date,
      contact_organization_name: selectedPipArea?.contact_organization_name,
      organization_guid: selectedPipArea?.organization_guid,
      consultation_area_name: selectedPipArea?.cnsltn_area_name,
      consultation_area_guid: selectedPipArea?.cnsltn_area_guid,
      consultation_area_update_date: selectedPipArea?.cnsltn_area_update_date,
      consultation_started_by_client: values?.consultation_started_by_client,
    };

    return dispatch(createNoticeOfWorkApplicationNation(id, payload)).then(() => {
      dispatch(fetchNoticeOfWorkApplicationNations(id));
      handleCloseModal();
    });

  };

  const openAddNationModal = (event) => {
    event.preventDefault();
    dispatch(openModal({
      props: {
        pipConsultationAreaOptions,
        onSubmit: handleAddNation,
        title: 'Add a new nation',
      },
      width: "50vw",
      content: modalConfig.ADD_NOW_NATION_MODAL,
    }));
  };

  const handleDeleteNation = (nationGuid: string) => {
    return dispatch(deleteNoticeOfWorkApplicationNation(id, nationGuid)).then(() => {
      dispatch(fetchNoticeOfWorkApplicationNations(id));
    })
  };

  const handleAddNationEvent = (values, nation) => {
    const payload = {
      now_application_nation_event_code: values?.now_application_nation_event_code,
      event_from: values?.event_from,
      event_to: values?.event_to,
      start_date: values?.start_date,
      end_date: values?.end_date,
    };

    return dispatch(createNoticeOfWorkApplicationNationEvent(
      id,
      nation.now_application_nation_guid,
      payload,
    )).then(() => {
      dispatch(fetchNoticeOfWorkApplicationNations(id));
      handleCloseModal();
    });
  };

  const openAddNationEventModal = (event, nation) => {
    event.preventDefault();
    const events = nation?.events ?? [];
    const latestCompletedEvent = getLatestEvent(events.filter((event) => event.end_date));
    const initialValues = latestCompletedEvent?.end_date
      ? { start_date: latestCompletedEvent.end_date }
      : {};

    dispatch(openModal({
      props: {
        initialValues,
        eventOptions: noticeOfWorkNationEventOptions,
        startDateDisabled: latestCompletedEvent?.end_date ? true : false,
        onSubmit: (values) => handleAddNationEvent(values, nation),
        title: "Add a new nation event",
      },
      width: "50vw",
      content: modalConfig.ADD_NOW_NATION_EVENT_MODAL,
    }))
  };


  return (
    <div>
      <ScrollContentWrapper id="consultation" title="Consultation">
        {isNoticeOfWorkNationsEnabled && (<>
          <NOWConsultationNationsTable
            nations={nations}
            isLoaded={props.isLoaded}
            expandedRowKeys={expandedRowKeys}
            onExpand={onExpand}
            openAddNationEventModal={openAddNationEventModal}
            handleDeleteNation={handleDeleteNation}
            userCanManageConsultationAdvisor={userCanManageConsultationAdvisor}
          />
          {
            userCanManageConsultationAdvisor && (
              <div className="right center-mobile">
                <NOWActionWrapper
                  permission={Permission.EDIT_PERMITS}
                  tab={CONSULTATION_TAB_CODE}
                  ignoreDelay
                >
                  <AddButton
                    onClick={(event) =>
                      openAddNationModal(event)
                    }
                    type="secondary"
                  >
                    Add Nation
                  </AddButton>
                </NOWActionWrapper>
              </div>)}
        </>
        )}
        <NOWApplicationReviewsTable
          isLoaded={props.isLoaded}
          noticeOfWorkReviews={props.noticeOfWorkReviews}
          noticeOfWorkReviewTypes={props.noticeOfWorkReviewTypes}
          handleDelete={props.handleDelete}
          openEditModal={props.openEditModal}
          handleEdit={props.handleEdit}
          handleDocumentDelete={props.handleDocumentDelete}
          type={CONSULTATION_TAB_CODE}
          categoriesToShow={categoriesToShow}
        />
        <div className="right center-mobile">
          <NOWActionWrapper
            permission={Permission.EDIT_PERMITS}
            tab={CONSULTATION_TAB_CODE}
            ignoreDelay
          >
            <AddButton
              onClick={(event) =>
                props.openAddReviewModal(
                  event,
                  props.handleAddReview,
                  CONSULTATION_TAB_CODE,
                  categoriesToShow
                )
              }
              type="secondary"
            >
              Add Consultation
            </AddButton>
          </NOWActionWrapper>
        </div>
      </ScrollContentWrapper>
    </div>
  );
};

export default Consultation;
