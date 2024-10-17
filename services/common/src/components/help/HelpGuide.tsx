import { Alert, Button, Col, Drawer, Row, Typography } from "antd";
import React, { FC, useEffect, useState } from "react";
import { Route, Switch, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { submit } from "redux-form";
import {
  getSystemFlag,
  isAuthenticated,
  userHasRole,
} from "@mds/common/redux/selectors/authenticationSelectors";
import { FORM, SystemFlagEnum, USER_ROLES } from "@mds/common/constants";
import {
  createHelp,
  updateHelp,
  deleteHelp,
  fetchHelp,
  getHelpByKey,
  HELP_GUIDE_ALL_TABS,
  EMPTY_HELP_KEY,
  clearHelp,
} from "@mds/common/redux/slices/helpSlice";
import HelpGuideForm from "./HelpGuideForm";
import { deleteConfirmWrapper } from "../common/ActionMenu";
import { formatSnakeCaseToSentenceCase } from "@mds/common/redux/utils/helpers";
import parse from "html-react-parser";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import Loading from "../common/Loading";

interface HelpGuideProps {
  helpKey: string;
}

export const HelpGuideContent: FC<HelpGuideProps> = ({ helpKey }) => {
  const dispatch = useDispatch();
  const system: SystemFlagEnum = useSelector(getSystemFlag);
  const params = useParams<any>();
  const { tab, activeTab } = params;
  const pageTab = tab ?? activeTab;

  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  // it needs to wait for authentication before it can make this check
  const canEditHelp = useSelector((state) => userHasRole(state, USER_ROLES.role_edit_helpdesk));
  const helpGuide = useSelector(getHelpByKey(helpKey, pageTab)) ?? {};
  const { help_guid } = helpGuide;
  const hasHelpGuide = Boolean(help_guid);
  const defaultGuide = helpKey === EMPTY_HELP_KEY;
  const { content = "" } = helpGuide ?? {};
  const [isLoaded, setIsLoaded] = useState(hasHelpGuide);
  const unformattedTitle = pageTab ?? helpKey;
  const title = formatSnakeCaseToSentenceCase(unformattedTitle);
  console.log(helpGuide);

  const showDrawer = () => setOpen(true);
  const hideDrawer = () => {
    setOpen(false);
    setIsEditMode(false);
  };

  const handleFetchData = () => {
    dispatch(fetchHelp({ helpKey, system })).then(() => setIsLoaded(true));
  };

  useEffect(() => {
    dispatch(clearHelp(helpKey));
    handleFetchData();
  }, [helpKey]);

  const handleDeleteGuide = () => {
    deleteConfirmWrapper("Help Guide", () =>
      dispatch(deleteHelp({ helpKey, help_guid })).then(() => {
        setIsEditMode(false);
      })
    );
  };

  const triggerSubmit = () => {
    dispatch(submit(FORM.EDIT_HELP_GUIDE));
  };

  const handleSaveGuide = (values) => {
    const page_tab = values.page_tab ?? HELP_GUIDE_ALL_TABS;
    const data = { ...values, page_tab, system };

    const payload = { helpKey, data };
    const forNewTab = helpGuide.page_tab === "all" && values.page_tab !== "all";
    const saveFunction =
      defaultGuide || forNewTab
        ? () => dispatch(createHelp(payload))
        : () => dispatch(updateHelp(payload));

    saveFunction().then((resp) => {
      if (resp.payload) {
        setIsEditMode(false);
      }
    });
  };

  const getFooterButtons = () => {
    const editButton = (
      <Button type="primary" onClick={() => setIsEditMode(true)}>
        {hasHelpGuide ? "Edit Help Guide" : "Create Help Guide"}
      </Button>
    );
    const submitButton = (
      <Button type="primary" onClick={triggerSubmit}>
        Publish Help Guide
      </Button>
    );
    const deleteButton = (
      <Button disabled={!hasHelpGuide} onClick={handleDeleteGuide}>
        Delete this Guide
      </Button>
    );
    const buttons = isEditMode ? (
      <>
        <Col>{deleteButton}</Col>
        <Col>{submitButton}</Col>
      </>
    ) : (
      <Col>{editButton}</Col>
    );
    const justify = isEditMode ? "space-between" : "end";
    return <Row justify={justify}>{buttons}</Row>;
  };
  const initialValues =
    hasHelpGuide && !defaultGuide ? helpGuide : { help_key: helpKey, page_tab: pageTab };
  const mainContent = isEditMode ? (
    <HelpGuideForm
      initialValues={initialValues}
      handleSaveGuide={handleSaveGuide}
      pageTab={pageTab}
    />
  ) : (
    parse(content)
  );

  return (
    <>
      <Button onClick={showDrawer}>?</Button>
      <Drawer
        placement="right"
        className="help-guide-drawer"
        onClose={hideDrawer}
        open={open}
        title="Help"
        footer={canEditHelp && getFooterButtons()}
        destroyOnClose
      >
        {isEditMode && (
          <Alert
            message="Publish Help Guide"
            showIcon
            type="warning"
            description="Content published here will be visible to MineSpace users. Ensure the language is appropriate and avoid sharing confidential information."
          />
        )}
        <Typography.Title level={2}>{title} Help Guide</Typography.Title>
        {isLoaded ? mainContent : <Loading />}
      </Drawer>
    </>
  );
};

const HelpGuide: FC = () => {
  const dispatch = useDispatch();
  const system: SystemFlagEnum = useSelector(getSystemFlag);
  const authenticated = useSelector(isAuthenticated);
  const { isFeatureEnabled } = useFeatureFlag();
  const helpFeatureEnabled = isFeatureEnabled(Feature.HELP_GUIDE);
  const globalRoutes = Object.entries(GLOBAL_ROUTES).sort(
    (a, b) => (b[1].priority || 0) - (a[1].priority || 0)
  );
  const defaultHelp = useSelector(getHelpByKey(EMPTY_HELP_KEY));

  useEffect(() => {
    if (authenticated && helpFeatureEnabled && !defaultHelp) {
      dispatch(fetchHelp({ helpKey: EMPTY_HELP_KEY, system }));
    }
  }, [authenticated, helpFeatureEnabled]);

  return authenticated && helpFeatureEnabled ? (
    <Switch>
      {globalRoutes.map(([routeName, routeData]) => {
        const { route = "", helpKey = "" } = routeData as any;
        return (
          <Route key={routeName} exact={true} path={route}>
            {helpKey && <HelpGuideContent helpKey={helpKey} />}
          </Route>
        );
      })}
    </Switch>
  ) : null;
};

export default HelpGuide;
