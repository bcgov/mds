import React from "react";
import { render } from "@testing-library/react";
import { UpdateNOWInspectorsForm } from "@/components/Forms/noticeOfWork/UpdateNOWInspectorsForm";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
    onSubmit: jest.fn(),
    setEditMode: jest.fn(),
};

const props = {
    noticeOfWork: NOW_MOCK.NOTICE_OF_WORK as any,
    inspectors: [],
    initialValues: {},
    isAdminView: true,
    isEditMode: true,
    title: "Save",
    noticeOfWorkTierOptions: [],
};

describe("UpdateNOWInspectorsForm", () => {
    it("renders properly", () => {
        const { container: component } = render(
            <ReduxWrapper>
                <UpdateNOWInspectorsForm {...props} {...dispatchProps} />
            </ReduxWrapper>
        );
        expect(component).toMatchSnapshot();
    });
});
