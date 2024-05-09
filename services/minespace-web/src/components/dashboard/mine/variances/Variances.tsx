import React, { FC, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Typography, Button } from "antd";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import moment from "moment";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  fetchVariancesByMine,
  createVariance,
  addDocumentToVariance,
  updateVariance,
} from "@mds/common/redux/actionCreators/varianceActionCreator";
import { getVariances } from "@mds/common/redux/selectors/varianceSelectors";
import {
  getVarianceStatusOptionsHash,
  getVarianceDocumentCategoryOptionsHash,
  getHSRCMComplianceCodesHash,
  getDropdownHSRCMComplianceCodes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getInspectorsHash } from "@mds/common/redux/selectors/partiesSelectors";
import { modalConfig } from "@/components/modalContent/config";
import VariancesTable from "@/components/dashboard/mine/variances/VariancesTable";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { IMine, ItemMap } from "@mds/common/interfaces";

export const Variances: FC = () => {
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  const variances = useSelector(getVariances);
  const inspectorsHash = useSelector(getInspectorsHash);
  const complianceCodesHash = useSelector(getHSRCMComplianceCodesHash);
  const complianceCodes = useSelector(getDropdownHSRCMComplianceCodes);
  const varianceStatusOptionsHash = useSelector(getVarianceStatusOptionsHash);
  const documentCategoryOptionsHash = useSelector(getVarianceDocumentCategoryOptionsHash);

  useEffect(() => {
    dispatch(fetchVariancesByMine({ mineGuid: mine.mine_guid })).then(() => {
      setIsLoaded(true);
    });
  }, []);

  const handleAddDocuments = (files: ItemMap<string>, varianceGuid) =>
    Promise.all(
      Object.entries(files).map(([document_manager_guid, document_name]) =>
        dispatch(
          addDocumentToVariance(
            { mineGuid: mine.mine_guid, varianceGuid },
            {
              variance_document_category_code: "REQ",
              document_manager_guid,
              document_name,
            }
          )
        )
      )
    );

  const handleCreateVariances = (files) => (values) => {
    const received_date = moment().format("YYYY-MM-DD");
    const payload = { received_date, variance_application_status_code: "REV", ...values };
    return dispatch(
      createVariance(
        {
          mineGuid: mine.mine_guid,
        },
        payload
      )
    ).then(async ({ data: { variance_guid } }) => {
      await dispatch(handleAddDocuments(files, variance_guid));
      dispatch(closeModal());
      dispatch(fetchVariancesByMine({ mineGuid: mine.mine_guid }));
    });
  };

  const handleUpdateVariance = (files, varianceGuid, codeLabel) => {
    // this was missing the second argument of "payload"- added 'null' but it wants a variance
    dispatch(updateVariance({ mineGuid: mine.mine_guid, varianceGuid, codeLabel }, null)).then(
      async () => {
        await handleAddDocuments(files, varianceGuid);
        dispatch(fetchVariancesByMine({ mineGuid: mine.mine_guid }));
        dispatch(closeModal());
      }
    );
  };

  const openEditVarianceModal = (variance) => {
    dispatch(
      openModal({
        props: {
          onSubmit: handleUpdateVariance,
          title: "Edit Variance",
          mineGuid: mine.mine_guid,
          mineName: mine.mine_name,
          varianceGuid: variance.variance_guid,
          varianceStatusOptionsHash: varianceStatusOptionsHash,
          complianceCodesHash: complianceCodesHash,
          documentCategoryOptionsHash: documentCategoryOptionsHash,
          width: 650,
        },
        content: modalConfig.EDIT_VARIANCE,
      })
    );
  };

  const openViewVarianceModal = (variance) => {
    dispatch(
      openModal({
        props: {
          variance,
          title: "View Variance",
          mineName: mine.mine_name,
          varianceStatusOptionsHash: varianceStatusOptionsHash,
          complianceCodesHash: complianceCodesHash,
          documentCategoryOptionsHash: documentCategoryOptionsHash,
          width: 650,
        },
        content: modalConfig.VIEW_VARIANCE,
      })
    );
  };

  const currentComplianceCodes = complianceCodes.filter((code) => !code.label.includes("Repealed"));

  const openCreateVarianceModal = (event) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          onSubmit: handleCreateVariances,
          title: "Apply for a Variance",
          mineGuid: mine.mine_guid,
          complianceCodes: currentComplianceCodes,
        },
        content: modalConfig.ADD_VARIANCE,
      })
    );
  };

  return (
    <Row>
      <Col span={24}>
        <AuthorizationWrapper>
          <Button className="dashboard-add-button" type="primary" onClick={openCreateVarianceModal}>
            <PlusCircleFilled />
            Apply for a Variance
          </Button>
        </AuthorizationWrapper>
        <Typography.Title level={1}>Variances</Typography.Title>
        <Typography.Paragraph>
          This table shows your mine&apos;s&nbsp;
          <Typography.Text className="color-primary" strong>
            variance history
          </Typography.Text>
          , including applications in progress and variances you may need to renew.
        </Typography.Paragraph>
        <VariancesTable
          variances={variances}
          mine={mine}
          isLoaded={isLoaded}
          varianceStatusOptionsHash={varianceStatusOptionsHash}
          complianceCodesHash={complianceCodesHash}
          openViewVarianceModal={openViewVarianceModal}
          openEditVarianceModal={openEditVarianceModal}
          inspectorsHash={inspectorsHash}
        />
      </Col>
    </Row>
  );
};

export default Variances;
