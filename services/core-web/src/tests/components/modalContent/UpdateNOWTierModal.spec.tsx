import React from "react";
import { render } from "@testing-library/react";
import { UpdateNOWTierModal } from "@/components/modalContent/UpdateNOWTierModal";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
    onSubmit: jest.fn(),
    closeModal: jest.fn(),
};

const props = {
    title: "Update Tier Category",
    noticeOfWork: NOW_MOCK.NOTICE_OF_WORK as any,
};

describe("UpdateNOWTierModal", () => {
    it("renders properly", () => {
        const { container: component } = render(
            <ReduxWrapper>
                <UpdateNOWTierModal {...props} {...dispatchProps} />
            </ReduxWrapper>
        );
        expect(component).toMatchSnapshot();
    });
});
