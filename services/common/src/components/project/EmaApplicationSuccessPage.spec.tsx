import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import EMAApplicationSuccessPage from "./EmaApplicationSuccessPage";

const props = {
    location: { state: { projectTitle: "test project" } },
};

function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            projectGuid: "c6525290-bf4c-42b4-9685-0bd97a71d305",
        }),
    };
}

jest.mock("react-router-dom", () => mockFunction());

describe("EMAApplicationSuccessPage", () => {
    it("renders properly", () => {
        const { container } = render(
            <BrowserRouter>
                <EMAApplicationSuccessPage {...props} />
            </BrowserRouter>
        );
        expect(container).toMatchSnapshot();
    });
});
