import React, { FC, useEffect, useState } from "react";
import { Divider, Alert, Tabs } from "antd";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getMineRegionHash,
  getMinistryContactTypesHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getMinistryContacts,
  getDistributionLists,
  fetchMinistryContacts,
  fetchDistributionLists,
  updateMinistryContact,
  deleteMinistryContact,
  createMinistryContact,
} from "@mds/common/redux/slices/minespaceSlice";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import MinistryContactsTable from "@/components/admin/contacts/MinistryContacts/MinistryContactsTable";
import AddButton from "@/components/common/buttons/AddButton";
import { IMinistryContact } from "@mds/common/interfaces";
import ResponsivePagination from "@mds/common/components/common/ResponsivePagination";

export const MineSpaceMinistryContactManagement: FC = () => {
  const dispatch = useAppDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  const ministryContacts = useAppSelector(getMinistryContacts);
  const distributionLists = useAppSelector(getDistributionLists);
  const mineRegionHash = useAppSelector(getMineRegionHash);
  const ministryContactTypesHash = useAppSelector(getMinistryContactTypesHash);

  useEffect(() => {
    Promise.all([dispatch(fetchMinistryContacts()), dispatch(fetchDistributionLists({}))]).then(() => {
      setIsLoaded(true);
    });
  }, [dispatch]);

  const handleDlPageChange = (page: number, per_page: number) => {
    dispatch(fetchDistributionLists({ page, per_page }));
  };

  const handleCreateContact = (values: Partial<IMinistryContact>) => {
    dispatch(createMinistryContact(values)).then(() => {
      dispatch(closeModal());
    });
  };

  const handleUpdateContact = (values: IMinistryContact) => {
    dispatch(updateMinistryContact({ contact_guid: values.contact_guid, payload: values })).then(
      () => {
        dispatch(closeModal());
      }
    );
  };

  const handleDeleteContact = (guid: string) => {
    setIsLoaded(false);
    dispatch(deleteMinistryContact(guid)).then(() => {
      setIsLoaded(true);
    });
  };

  const openContactModal = (isEdit: boolean, record: IMinistryContact | null = null) => {
    const distributionListOptions = distributionLists.records.map((dl) => ({
      value: dl.distribution_list_guid,
      label: dl.distribution_list_name,
    }));
    dispatch(
      openModal({
        props: {
          title: isEdit ? "Update MCM Contact" : "Create MCM Contact",
          closeModal: () => dispatch(closeModal()),
          initialValues: isEdit ? record : {},
          onSubmit: isEdit ? handleUpdateContact : handleCreateContact,
          isEdit,
          contacts: ministryContacts,
          distributionListOptions,
        },
        content: modalConfig.MINISTRY_CONTACT_MODAL,
      })
    );
  };

  const officeCodes = ["ROE", "MMO"];
  const offices = ministryContacts.filter(({ emli_contact_type_code }) =>
    officeCodes.includes(emli_contact_type_code)
  );
  const contacts = ministryContacts.filter(
    ({ emli_contact_type_code }) => !officeCodes.includes(emli_contact_type_code)
  );

  return (
    <div>
      <div className="landing-page__header">
        <div className="inline-flex between">
          <h1>MineSpace MCM Contact Management</h1>
          <AuthorizationWrapper permission={Permission.ADMIN}>
            <AddButton onClick={() => openContactModal(false)}>Create MCM Contact</AddButton>
          </AuthorizationWrapper>
        </div>
      </div>
      <div className="tab__content">
        <Tabs defaultActiveKey="1" type="card">
          <Tabs.TabPane tab="MCM Contacts" key="1">
            <Alert
              message="MCM contacts and offices are displayed in multiple places within Core and MineSpace."
              closable
              description={
                <>
                  The Contacts are displayed in MineSpace to proponents.
                  <br />
                  The Offices are displayed in MineSpace, shown on the footer on permits, and NoW
                  documents, and are the default email address for variances, code required reports, and
                  mine information notifications.
                </>
              }
              type="info"
              showIcon
            />
            <h2>Offices</h2>
            <Divider />
            <MinistryContactsTable
              isLoaded={isLoaded}
              contacts={offices}
              isOffice
              mineRegionHash={mineRegionHash}
              openEditModal={openContactModal}
              handleDeleteContact={handleDeleteContact}
              MinistryContactTypesHash={ministryContactTypesHash}
            />
            <br />
            <h2>Contacts</h2>
            <Divider />
            <MinistryContactsTable
              isLoaded={isLoaded}
              contacts={contacts}
              mineRegionHash={mineRegionHash}
              openEditModal={openContactModal}
              handleDeleteContact={handleDeleteContact}
              MinistryContactTypesHash={ministryContactTypesHash}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Distribution Lists" key="2">
            <Alert
              message="Distribution Lists"
              closable
              description={
                <>
                  MCM Contacts assigned to these distribution lists will receive automated email notifications from the system based on the event matching the list name.
                </>
              }
              type="info"
              showIcon
            />
            <br />
            {distributionLists.records.map((dl) => {
              const dlContacts = ministryContacts.filter((c) =>
                c.distribution_list_guids?.includes(dl.distribution_list_guid)
              );
              return (
                <div key={dl.distribution_list_guid} style={{ marginBottom: "40px" }}>
                  <h2>{dl.distribution_list_name}</h2>
                  <Divider />
                  <MinistryContactsTable
                    isLoaded={isLoaded}
                    contacts={dlContacts}
                    mineRegionHash={mineRegionHash}
                    openEditModal={openContactModal}
                    handleDeleteContact={handleDeleteContact}
                    MinistryContactTypesHash={ministryContactTypesHash}
                    hideDelete={true}
                  />
                </div>
              );
            })}
            <ResponsivePagination
              onPageChange={handleDlPageChange}
              currentPage={distributionLists.current_page}
              pageTotal={distributionLists.total}
              itemsPerPage={distributionLists.items_per_page}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthorizationGuard(Permission.EDIT_MINISTRY_CONTACTS)(
  MineSpaceMinistryContactManagement
);
