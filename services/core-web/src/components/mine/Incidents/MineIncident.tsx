import React, { useEffect, useState } from "react";
import { flattenObject } from "@common/utils/helpers";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import { getFormSyncErrors, getFormValues } from "redux-form";
import { Tag } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { getMineIncident } from "@mds/common/redux/reducers/incidentReducer";
import {
  createMineIncident,
  fetchMineIncident,
  updateMineIncident,
} from "@mds/common/redux/actionCreators/incidentActionCreator";
import { clearMineIncident } from "@mds/common/redux/actions/incidentActions";
import * as Strings from "@mds/common/constants/strings";
import * as FORM from "@/constants/forms";
import IncidentForm from "@/components/Forms/incidents/IncidentForm";
import ScrollSideMenu from "@mds/common/components/common/ScrollSideMenu";
import * as routes from "@/constants/routes";

interface IParams {
  mineGuid?: string;
  mineIncidentGuid?: string;
  mineDocumentGuid?: string;
}

export const MineIncident = (props) => {
  const dispatch = useDispatch();

  const { history } = props;
  const params = useParams<IParams>();
  const { mineGuid, mineIncidentGuid = null } = params;
  const { pathname, search = null } = useLocation();
  const [isNewIncident, setIsNewIncident] = useState<boolean>(!mineIncidentGuid);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [fixedTop, setIsFixedTop] = useState<boolean>(false);

  const incident = useSelector(getMineIncident);
  const formValues = useSelector((state) => getFormValues(FORM.ADD_EDIT_INCIDENT)(state)) || {};
  const formErrors = useSelector((state) => getFormSyncErrors(FORM.ADD_EDIT_INCIDENT)(state)) || {};

  const isEditPage = !!params.mineIncidentGuid;
  const mineName = isNewIncident
    ? new URLSearchParams(search).get("mine_name")
    : incident.mine_name;

  const isEditMode = isEditPage || isNewIncident;

  const sideBarRoute = (() => {
    if (isNewIncident) {
      return { url: routes.CREATE_MINE_INCIDENT, params: [mineGuid, mineName] };
    }
    if (isEditMode) {
      return { url: routes.EDIT_MINE_INCIDENT, params: [mineGuid, mineIncidentGuid] };
    }
    return { url: routes.VIEW_MINE_INCIDENT, params: [mineGuid, mineIncidentGuid] };
  })();

  const handleFetchData = async (): Promise<void> => {
    if (mineGuid && mineIncidentGuid) {
      setIsNewIncident(false);
      setIsLoaded(false);
      await dispatch(fetchMineIncident(mineGuid, mineIncidentGuid));
      setIsLoaded(true);
    }
    return Promise.resolve();
  };

  const handleCreateMineIncident = (formattedValues: any) => {
    setIsLoaded(false);
    return dispatch(createMineIncident(mineGuid, formattedValues))
      .then(({ data: { mine_guid, mine_incident_guid } }) =>
        history.replace(routes.EDIT_MINE_INCIDENT.dynamicRoute(mine_guid, mine_incident_guid))
      )
      .then(() => handleFetchData());
  };

  const handleUpdateMineIncident = (formattedValues) => {
    setIsLoaded(false);
    return dispatch(updateMineIncident(mineGuid, mineIncidentGuid, formattedValues)).then(() =>
      handleFetchData()
    );
  };

  const formatPayload = (values) => {
    const documents = [
      ...values?.initial_incident_documents,
      ...values?.final_report_documents,
      ...values?.internal_ministry_documents,
    ];

    return {
      ...values,
      updated_documents: documents,
    };
  };

  const handleSaveData = () => {
    const incidentExists = Boolean(formValues.mine_incident_guid);
    const errors = Object.keys(flattenObject(formErrors));

    const { final_report_documents, documents = [] } = formValues;
    const isFinalReport =
      final_report_documents.length > 0 ||
      documents.filter(
        (doc) => doc.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.final
      ).length > 0;

    if (!formValues.status_code) {
      formValues.status_code = isFinalReport ? "FRS" : "AFR";
    } else if (formValues.status_code === "AFR" && isFinalReport) {
      formValues.status_code = "FRS";
    }

    if (errors.length === 0) {
      if (!incidentExists) {
        return handleCreateMineIncident(formatPayload(formValues));
      }
      return handleUpdateMineIncident(formatPayload(formValues));
    }
    return null;
  };

  const formatInitialValues = () => {
    if (!isNewIncident) {
      return {
        ...incident,
        categories: incident?.categories?.map((cat) => cat?.mine_incident_category_code),
        initial_incident_documents: [],
        final_report_documents: [],
        internal_ministry_documents: [],
      };
    }
    return {
      initial_incident_documents: [],
      final_report_documents: [],
      internal_ministry_documents: [],
    };
  };

  const incidentFormProps = {
    initialValues: formatInitialValues(),
    isEditMode: isEditMode,
    isNewIncident: isNewIncident,
    incident: incident,
    handlers: {
      handleSaveData,
      handleFetchData: handleFetchData,
    },
  };

  const scrollSideMenuProps = {
    menuOptions: [
      { href: "initial-report", title: "Initial Report" },
      {
        href: "incident-details",
        title: "Incident Details",
      },
      { href: "documentation", title: "Documentation" },
      {
        href: "final-report",
        title: "Final Report",
      },
      { href: "ministry-follow-up", title: "Ministry Follow Up" },
      {
        href: "internal-documents",
        title: "Internal Documents",
      },
      { href: "internal-ministry-comments", title: "Comments" },
    ],
    featureUrlRoute: sideBarRoute.url.hashRoute,
    featureUrlRouteArguments: sideBarRoute.params,
  };

  const handleScroll = () => {
    if (window.pageYOffset > 170 && !fixedTop) {
      setIsFixedTop(true);
    } else if (window.pageYOffset <= 170 && fixedTop) {
      setIsFixedTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }, []);

  useEffect(() => {
    handleFetchData().then(() => {
      setIsLoaded(true);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        props.clearMineIncident();
      };
    });
    handleScroll();
  }, [pathname]);

  return isLoaded ? (
    <>
      <div className="page">
        <div
          className={fixedTop ? "padding-lg view--header fixed-scroll" : " padding-lg view--header"}
          style={{ paddingBottom: 0 }}
        >
          <h1>
            {incident.mine_incident_guid ? "Mine Incident" : "Create New Incident"}
            &nbsp;
            <span>
              <Tag title={`Mine: ${mineName}`}>
                <Link
                  style={{ textDecoration: "none" }}
                  to={routes.MINE_GENERAL.dynamicRoute(mineGuid)}
                >
                  <EnvironmentOutlined className="padding-sm--right" />
                  {mineName}
                </Link>
              </Tag>
            </span>
          </h1>
          <Link to={routes.MINE_INCIDENTS.dynamicRoute(mineGuid)}>
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to All Incidents
          </Link>
          <hr />
        </div>
        <div className={fixedTop ? "side-menu--fixed" : "side-menu"}>
          <ScrollSideMenu {...scrollSideMenuProps} />
        </div>
        <div className={fixedTop ? "side-menu--content top-125" : "side-menu--content"}>
          <IncidentForm {...incidentFormProps} />
        </div>
      </div>
    </>
  ) : (
    <div />
  );
};

export default MineIncident;
