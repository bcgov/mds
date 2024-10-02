import { getHelpByKey, createHelp } from "@mds/common/redux/slices/appHelpSlice";
import { Button, Drawer } from "antd";
import React, { FC, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, Switch, useParams } from "react-router-dom";
import * as routes from "@/constants/routes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { Field } from "redux-form";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCheckbox from "@mds/common/components/forms/RenderCheckbox";
import RenderRichTextEditor from "@mds/common/components/forms/RenderRichTextEditor";
import parse from "html-react-parser";

interface AppHelpContentProps {
  helpKey: string;
}
const AppHelpContent: FC<AppHelpContentProps> = ({ helpKey }) => {
  const dispatch = useDispatch();

  const params = useParams<any>();
  const { tab = "", activeTab = "" } = params;
  const tabKey = activeTab ?? tab;
  const keyToUse = tabKey ? `${helpKey}_${tabKey}` : helpKey;
  const [editMode, setEditMode] = useState(false);
  const appHelp = useSelector(getHelpByKey(helpKey, tabKey));
  const hasPermission = true;
  console.log(appHelp);

  const onSubmit = async (values) => {
    console.log("keyToUse", keyToUse);
    const { create_fallback } = values;
    const key = create_fallback ? helpKey : keyToUse;
    await dispatch(createHelp({ helpKey: key, data: values }));
    setEditMode(false);
  };

  if (hasPermission && editMode) {
    return (
      <FormWrapper
        name={`EDIT_APP_HELP-${keyToUse}`}
        onSubmit={onSubmit}
        initialValues={appHelp}
        isEditMode={editMode}
        reduxFormConfig={{ enableReinitialize: true }}
      >
        Editing page help for key: <b>{keyToUse}</b>
        <Field label="React Quill editor" name="content" component={RenderRichTextEditor} />
        <Field component={RenderCheckbox} name="is_draft" label="Save as draft" />
        {tabKey && <Field component={RenderCheckbox} name="create_fallback" label="For all tabs" />}
        {!editMode && <Button onClick={() => setEditMode(true)}>Edit</Button>}
        <RenderSubmitButton />
      </FormWrapper>
    );
  }
  if (appHelp && !appHelp.is_draft) {
    return (
      <>
        <div>{parse(appHelp.content)}</div>
        <div>
          <Button onClick={() => setEditMode(true)}>Edit</Button>
        </div>
      </>
    );
  }
  return (
    <>
      <div>For help with using MineSpace, contact us at email@email.com</div>
      {hasPermission && (
        <div>
          <Button onClick={() => setEditMode(true)}>Edit</Button>
        </div>
      )}
    </>
  );
};

export const AppHelp: FC = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const hideDrawer = () => setOpen(false);

  return (
    <Switch>
      {Object.entries(routes).map(([routeName, route]) => {
        return (
          <Route key={routeName} exact={true} path={route.route}>
            {route.helpKey && (
              <>
                <Button onClick={showDrawer}>?</Button>
                <Drawer placement="right" onClose={hideDrawer} open={open}>
                  <AppHelpContent helpKey={route.helpKey} />
                </Drawer>
              </>
            )}
          </Route>
        );
      })}
    </Switch>
  );
};
