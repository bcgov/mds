import React, { FC, useState, useEffect } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import moment from "moment";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  createVariance,
  fetchVariancesByMine,
  addDocumentToVariance,
  updateVariance,
  deleteVariance,
} from "@mds/common/redux/actionCreators/varianceActionCreator";
import { getMines, getMineGuid } from "@mds/common/redux/selectors/mineSelectors";
import {
  getDropdownHSRCMComplianceCodes,
  getHSRCMComplianceCodesHash,
  getDropdownVarianceStatusOptions,
  getVarianceStatusOptionsHash,
  getDropdownVarianceDocumentCategoryOptions,
  getVarianceDocumentCategoryOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getVarianceApplications,
  getApprovedVariances,
} from "@mds/common/redux/selectors/varianceSelectors";
import {
  getDropdownInspectors,
  getInspectorsHash,
} from "@mds/common/redux/selectors/partiesSelectors";
import * as Strings from "@mds/common/constants/strings";
import MineVarianceTable from "./MineVarianceTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/buttons/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { IMine, IVariance, IOption, IGroupedDropdownList } from "@mds/common";
import { ActionCreator } from "@/interfaces/actionCreator";

interface MineVarianceProps {
  mines: Partial<IMine>;
  mineGuid: string;
  approvedVariances: IVariance[];
  varianceApplications: IVariance[];
  openModal: typeof openModal;
  closeModal: typeof closeModal;
  fetchVariancesByMine: ActionCreator<typeof fetchVariancesByMine>;
  createVariance: ActionCreator<typeof createVariance>;
  updateVariance: ActionCreator<typeof updateVariance>;
  deleteVariance: ActionCreator<typeof deleteVariance>;
  addDocumentToVariance: ActionCreator<typeof addDocumentToVariance>;
  complianceCodes: IOption[];
  complianceCodesHash: any;
  inspectors: IGroupedDropdownList[];
  varianceDocumentCategoryOptions: IOption[];
  varianceStatusOptionsHash: any;
}

export const MineVariance: FC<MineVarianceProps> = (props) => {
  const [isLoaded, setisLoaded] = useState(false);

  useEffect(() => {
    props.fetchVariancesByMine({ mineGuid: props.mineGuid }).then(() => {
      setisLoaded(true);
    });
  }, []);

  const handleDeleteVariance = (variance) => {
    return props.deleteVariance(variance.mine_guid, variance.variance_guid).then(() => {
      props.fetchVariancesByMine({ mineGuid: props.mineGuid });
    });
  };

  const handleAddVariances = (files, isApplication) => (values) => {
    const { variance_document_category_code } = values;
    const variance_application_status_code = isApplication
      ? Strings.VARIANCE_APPLICATION_CODE
      : Strings.VARIANCE_APPROVED_CODE;
    const received_date = values.received_date
      ? values.received_date
      : moment().format("YYYY-MM-DD");
    const newValues = { received_date, variance_application_status_code, ...values };
    return props
      .createVariance({ mineGuid: props.mineGuid }, newValues)
      .then(async ({ data: { variance_guid } }) => {
        await Promise.all(
          Object.entries(files).map(([document_manager_guid, document_name]) =>
            props.addDocumentToVariance(
              { mineGuid: props.mineGuid, varianceGuid: variance_guid },
              {
                document_manager_guid,
                document_name: String(document_name),
                variance_document_category_code,
              }
            )
          )
        ).then(() => {
          props.closeModal();
          setisLoaded(false);
          props.fetchVariancesByMine({ mineGuid: props.mineGuid }).then(() => setisLoaded(true));
        });
      });
  };

  const handleUpdateVariance = (files, variance, isApproved) => (values) => {
    // If the application is approved, set the issue date to today and set the expiry date to 5 years from today if it is empty.
    const { variance_document_category_code } = values;
    let expiry_date;
    let issue_date;
    if (isApproved) {
      issue_date = values.issue_date ? values.issue_date : moment().format("YYYY-MM-DD");
      expiry_date = values.expiry_date
        ? values.expiry_date
        : moment(issue_date, "YYYY-MM-DD").add(5, "years");
    }
    const varianceGuid = variance.variance_guid;
    const codeLabel = props.complianceCodesHash[variance.compliance_article_id];
    return props
      .updateVariance(
        { mineGuid: props.mineGuid, varianceGuid, codeLabel },
        { ...values, issue_date, expiry_date }
      )
      .then(async () => {
        await Promise.all(
          Object.entries(files).map(([document_manager_guid, document_name]) =>
            props.addDocumentToVariance(
              { mineGuid: props.mineGuid, varianceGuid },
              {
                document_manager_guid,
                document_name: String(document_name),
                variance_document_category_code,
              }
            )
          )
        );
      })
      .then(() => {
        props.closeModal();
        setisLoaded(false);
        props.fetchVariancesByMine({ mineGuid: props.mineGuid }).then(() => setisLoaded(true));
      });
  };

  const openEditVarianceModal = (variance) => {
    const mine = props.mines[props.mineGuid];
    props.openModal({
      props: {
        onSubmit: handleUpdateVariance,
        title: props.complianceCodesHash[variance.compliance_article_id],
        mineGuid: mine.mine_guid,
        mineName: mine.mine_name,
        varianceGuid: variance.variance_guid,
      },
      content: modalConfig.EDIT_VARIANCE,
    });
  };

  const openViewVarianceModal = (variance) => {
    const mine = props.mines[props.mineGuid];
    props.openModal({
      props: {
        variance,
        title: props.complianceCodesHash[variance.compliance_article_id],
        mineName: mine.mine_name,
      },
      content: modalConfig.VIEW_VARIANCE,
      isViewOnly: true,
    });
  };

  const openVarianceModal = (event, mine) => {
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleAddVariances,
        title: ModalContent.ADD_VARIANCE(mine.mine_name),
        mineGuid: mine.mine_guid,
        complianceCodes: props.complianceCodes,
        documentCategoryOptions: props.varianceDocumentCategoryOptions,
        inspectors: props.inspectors,
      },
      content: modalConfig.ADD_VARIANCE,
    });
  };

  const renderVarianceTables = (mine) => (
    <div>
      <br />
      <h4 className="uppercase">Variance Applications</h4>
      <br />
      <MineVarianceTable
        isLoaded={isLoaded}
        openEditVarianceModal={openEditVarianceModal}
        openViewVarianceModal={openViewVarianceModal}
        variances={props.varianceApplications}
        complianceCodesHash={props.complianceCodesHash}
        mine={mine}
        varianceStatusOptionsHash={props.varianceStatusOptionsHash}
        isApplication
        handleDeleteVariance={handleDeleteVariance}
      />
      <br />
      <h4 className="uppercase">Approved Variances</h4>
      <br />
      <MineVarianceTable
        isLoaded={isLoaded}
        openEditVarianceModal={openEditVarianceModal}
        openViewVarianceModal={openViewVarianceModal}
        variances={props.approvedVariances}
        complianceCodesHash={props.complianceCodesHash}
        varianceStatusOptionsHash={props.varianceStatusOptionsHash}
        mine={mine}
        handleDeleteVariance={handleDeleteVariance}
      />
    </div>
  );

  const mine = props.mines[props.mineGuid];
  return (
    <div className="tab__content">
      <div>
        <h2>Variances</h2>
        <Divider />
      </div>
      <div className="inline-flex flex-end">
        <AuthorizationWrapper permission={Permission.EDIT_VARIANCES}>
          <AddButton onClick={(event) => openVarianceModal(event, mine)}>Add Variance</AddButton>
        </AuthorizationWrapper>
      </div>
      {renderVarianceTables(mine)}
    </div>
  );
};

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  inspectors: getDropdownInspectors(state),
  inspectorsHash: getInspectorsHash(state),
  varianceStatusOptions: getDropdownVarianceStatusOptions(state),
  varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
  complianceCodes: getDropdownHSRCMComplianceCodes(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  approvedVariances: getApprovedVariances(state),
  varianceApplications: getVarianceApplications(state),
  varianceDocumentCategoryOptions: getDropdownVarianceDocumentCategoryOptions(state),
  varianceDocumentCategoryOptionsHash: getVarianceDocumentCategoryOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createVariance,
      fetchVariancesByMine,
      addDocumentToVariance,
      updateVariance,
      deleteVariance,
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MineVariance);
