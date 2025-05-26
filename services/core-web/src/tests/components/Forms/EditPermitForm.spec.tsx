import React from "react";
import { render } from "@testing-library/react";
import { EditPermitForm } from "@/components/Forms/EditPermitForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

describe("EditPermitForm", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper>
                <EditPermitForm
                    onSubmit={jest.fn()}
                    title={"mockTitle"}
                    initialValues={MOCK.PERMITS[0]}
                />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});