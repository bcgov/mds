import React, { FC, useState } from "react";
import { Button, Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { formatDate } from "@common/utils/helpers";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getDropdownInspectors,
  getDropdownConsultationAdvisors,
} from "@mds/common/redux/slices/partiesSlice";
import { INoticeOfWork, INoWDocumentType } from "@mds/common/interfaces";
import {
  generateNoticeOfWorkApplicationDocument,
  fetchNoticeOfWorkApplicationContextTemplate,
} from "@/actionCreators/documentActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import NOWApplicationAdministrative from "@/components/noticeOfWork/applications/administrative/NOWApplicationAdministrative";

/**
 * @constant AdministrativeTab contains the Securities/Bond tracking, inspectors, tier and progress
 * tracking for a Notice of Work Application, plus the administrative Actions menu.
 */

export interface AdministrativeTabProps {
  fixedTop: boolean;
}

export const AdministrativeTab: FC<AdministrativeTabProps> = ({ fixedTop }) => {
  const dispatch = useAppDispatch();

  const [adminMenuVisible, setAdminMenuVisible] = useState(false);
  const [isInspectorsLoaded, setIsInspectorsLoaded] = useState(true);

  const noticeOfWork: INoticeOfWork = useAppSelector(getNoticeOfWork);
  const inspectors = useAppSelector(getDropdownInspectors);
  const consultationAdvisors = useAppSelector(getDropdownConsultationAdvisors);
  const generatableApplicationDocuments: Record<string, INoWDocumentType> = useAppSelector(
    getGeneratableNoticeOfWorkApplicationDocumentTypeOptions
  );
  const isNoWApplication = noticeOfWork.application_type_code === "NOW";

  const handleGenerateDocumentFormSubmit = (documentType: INoWDocumentType, values: any) => {
    const documentTypeCode = documentType.now_application_document_type_code;
    const newValues = values;
    documentType.document_template.form_spec
      .filter((field) => field.type === "DATE")
      .forEach((field) => {
        newValues[field.id] = formatDate(newValues[field.id]);
      });
    const payload = {
      now_application_guid: noticeOfWork.now_application_guid,
      template_data: newValues,
    };
    return dispatch(
      generateNoticeOfWorkApplicationDocument(
        documentTypeCode,
        payload,
        "Successfully created document and attached it to Notice of Work",
        false,
        () => {
          dispatch(fetchImportedNoticeOfWorkApplication(noticeOfWork.now_application_guid));
        }
      )
    ).then(() => {
      dispatch(closeModal());
    });
  };

  const handleDocumentPreview = (documentType: INoWDocumentType, values: any) => {
    const documentTypeCode = documentType.now_application_document_type_code;
    const newValues = values;
    documentType.document_template.form_spec
      .filter((field) => field.type === "DATE")
      .forEach((field) => {
        newValues[field.id] = formatDate(newValues[field.id]);
      });
    const payload = {
      now_application_guid: noticeOfWork.now_application_guid,
      template_data: newValues,
    };
    return dispatch(
      generateNoticeOfWorkApplicationDocument(
        documentTypeCode,
        payload,
        "Successfully created the preview document",
        true,
        () => {}
      )
    );
  };

  const handleGenerateDocument = (menuItem: { key: string }) => {
    const documentTypeCode = menuItem.key;
    const documentType = generatableApplicationDocuments[documentTypeCode];
    const signature = noticeOfWork?.issuing_inspector?.signature;
    return dispatch(
      fetchNoticeOfWorkApplicationContextTemplate(
        documentTypeCode,
        noticeOfWork.now_application_guid
      )
      // The thunk resolves with the same payload it stores, so read it from the response rather
      // than the selector — a value captured from the store here would be the pre-fetch one.
    ).then((response) => {
      const contextTemplate: INoWDocumentType = response.data;
      const initialValues = {};
      contextTemplate.document_template.form_spec.forEach((item) => {
        initialValues[item.id] = item["context-value"];
      });
      dispatch(
        openModal({
          props: {
            initialValues,
            documentType: contextTemplate,
            onSubmit: (values: any) => handleGenerateDocumentFormSubmit(documentType, values),
            preview: handleDocumentPreview,
            title: `Generate ${documentType.description}`,
            signature,
            allowDocx: true,
          },
          width: "75vw",
          content: modalConfig.GENERATE_DOCUMENT,
        })
      );
    });
  };

  const handleChangeNOWMineAndLocation = (values: any) => {
    const message = values.latitude
      ? "Successfully updated Notice of Work location"
      : "Successfully transferred Notice of Work";
    return dispatch(
      updateNoticeOfWorkApplication(values, noticeOfWork.now_application_guid, message)
    )
      .then(() => dispatch(fetchImportedNoticeOfWorkApplication(noticeOfWork.now_application_guid)))
      .then(() => dispatch(closeModal()));
  };

  const openChangeNOWMineModal = () => {
    dispatch(
      openModal({
        props: {
          initialValues: {
            mine_guid: noticeOfWork.mine_guid,
          },
          onSubmit: handleChangeNOWMineAndLocation,
          title: `Transfer Notice of Work`,
          noticeOfWork,
        },
        width: "75vw",
        content: modalConfig.CHANGE_NOW_MINE,
      })
    );
  };

  const openChangeNOWLocationModal = () => {
    dispatch(
      openModal({
        props: {
          initialValues: {
            mine_guid: noticeOfWork.mine_guid,
            latitude: noticeOfWork.latitude,
            longitude: noticeOfWork.longitude,
          },
          mineGuid: noticeOfWork.mine_guid,
          onSubmit: handleChangeNOWMineAndLocation,
          title: `Edit Location`,
          noticeOfWork,
        },
        width: "75vw",
        content: modalConfig.CHANGE_NOW_LOCATION,
      })
    );
  };

  const handleUpdateNoticeOfWork = (values: any, message: string, callback?: () => void) => {
    setIsInspectorsLoaded(false);
    return dispatch(
      updateNoticeOfWorkApplication(values, noticeOfWork.now_application_guid, message)
    ).then(() => {
      dispatch(fetchImportedNoticeOfWorkApplication(noticeOfWork.now_application_guid)).then(() => {
        setIsInspectorsLoaded(true);
        if (callback) {
          callback();
        }
      });
    });
  };

  const handleUpdateInspectors = (values: any, callback?: () => void) =>
    handleUpdateNoticeOfWork(values, "Successfully updated the assigned inspectors", callback);

  const handleUpdateTier = (values: any, callback?: () => void) =>
    handleUpdateNoticeOfWork(values, "Successfully updated the Tier Category", callback);

  const menu = () => {
    const generateLettersList = isNoWApplication ? ["CAL", "NPE"] : ["NPE"];
    return (
      <Menu>
        {isNoWApplication && (
          <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
            <Menu.Item
              key="transfer-to-a-different-mine"
              className="custom-menu-item"
              onClick={openChangeNOWMineModal}
            >
              Transfer to a Different Mine
            </Menu.Item>
          </NOWActionWrapper>
        )}
        <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
          <Menu.Item
            key="edit-application-lat-long"
            className="custom-menu-item"
            onClick={openChangeNOWLocationModal}
          >
            Edit Application Lat/Long
          </Menu.Item>
        </NOWActionWrapper>
        {generatableApplicationDocuments &&
          Object.values(generatableApplicationDocuments).length > 0 && (
            <Menu.SubMenu key="generate-documents" title="Generate Documents">
              {Object.values(generatableApplicationDocuments)
                .filter(({ now_application_document_type_code }) =>
                  generateLettersList.includes(now_application_document_type_code)
                )
                .sort((docA, docB) => docA.description.localeCompare(docB.description))
                .map((document) => (
                  <Menu.Item
                    key={document.now_application_document_type_code}
                    onClick={handleGenerateDocument}
                  >
                    {document.description}
                  </Menu.Item>
                ))}
            </Menu.SubMenu>
          )}
      </Menu>
    );
  };

  return (
    <div>
      <NOWTabHeader
        tab="ADMIN"
        tabName="Administrative"
        fixedTop={fixedTop}
        noticeOfWork={noticeOfWork}
        tabActions={
          <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
            <Dropdown
              overlay={menu()}
              placement="bottomLeft"
              onVisibleChange={setAdminMenuVisible}
              visible={adminMenuVisible}
            >
              <Button type={"secondary" as any} className="full-mobile">
                Actions
                <DownOutlined />
              </Button>
            </Dropdown>
          </NOWActionWrapper>
        }
      />
      <div className={fixedTop ? "side-menu--fixed" : "side-menu"}>
        <NOWSideMenu tabSection="administrative" />
      </div>
      <div className={fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"}>
        <NOWApplicationAdministrative
          inspectors={inspectors}
          consultationAdvisors={consultationAdvisors}
          handleUpdateInspectors={handleUpdateInspectors}
          handleUpdateTier={handleUpdateTier}
          isLoaded={isInspectorsLoaded}
        />
      </div>
    </div>
  );
};

export default AdministrativeTab;
