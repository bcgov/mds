describe("Major Projects", () => {
  beforeEach(() => {
    cy.login();

    cy.get('[data-cy="home-link-button-major-projects"]', { timeout: 10000 }).click({
      force: true,
    });

    // .eq(1) selects the second row (0-based index).
    cy.get("[data-cy=major-projects-table-open-button]", { timeout: 10000 })
      .eq(1)
      .find("button")
      .click({ force: true });

    cy.get('a[data-cy="project-description-view-link"]', { timeout: 5000 }).click();
  });

  it("should upload and download a document successfully", () => {
    const fileName = "dummy.pdf";

    cy.contains("Document Upload").click();

    cy.contains("Edit Project Description").click();

    cy.fixture(fileName).then((fileContent) => {
      // Intercept the POST request and stub the response
      cy.intercept(
        "POST",
        /.*\/(api\/)?projects\/.*\/project-summaries\/.*\/documents\?mine_guid=.*$/,
        {
          statusCode: 200,
          body: {
            document_manager_guid: "332d6f13-cd09-4b55-93d7-52bd7e557fa4",
            upload: { uploadId: "uploadId", parts: [{ part: 1, size: 100, url: "http://test" }] },
          }, // Stubbed response
        }
      ).as("uploadRequest");

      cy.intercept("PUT", "http://test", {
        statusCode: 200,
        headers: {
          etag: "etagpart1",
        },
      }).as("putRequest");

      cy.intercept(
        "PATCH",
        /.*\/(api\/)?(document-manager\/)?documents\/332d6f13-cd09-4b55-93d7-52bd7e557fa4\/complete-upload$/,
        {
          statusCode: 204,
        }
      ).as("completeRequest");

      cy.intercept(
        "GET",
        /.*\/(api\/)?mines\/documents\/upload\/332d6f13-cd09-4b55-93d7-52bd7e557fa4$/,
        {
          statusCode: 200,
          body: {
            status: "Success",
          },
        }
      ).as("statusRequest");

      cy.get('input[type="file"]')
        .eq(1)
        .attachFile({
          fileContent: fileContent,
          fileName: fileName,
          mimeType: "application/pdf",
        });

      // Wait for the upload request to complete(simulated)
      cy.wait("@uploadRequest").then((interception) => {
        // Assert that the response body contains the expected message
        console.log(interception);

        expect(interception.request.headers.filename).to.equal("dummy.pdf");
        expect(interception.request.headers["upload-length"]).to.equal("16368");
        expect(interception.request.headers["upload-protocol"]).to.equal("s3-multipart");
        expect(interception.request.headers["upload-metadata"]).to.equal(
          "filename ZHVtbXkucGRm,filetype YXBwbGljYXRpb24vcGRm"
        );
      });

      cy.wait("@putRequest");
      cy.wait("@completeRequest").then((interception) => {
        expect(interception.request.body).to.deep.equal({
          parts: [{ part: 1, etag: "etagpart1" }],
          upload_id: "uploadId",
        });
      });
    });

    // Intercept the GET request and stub the response
    cy.intercept("GET", "**/documents**", (req) => {
      // Set the desired response properties
      req.reply({
        statusCode: 301,
        body: "Mocked response data",
      });
    }).as("downloadRequest");
    cy.wait(2500);
    cy.get("[data-cy=menu-actions-button]")
      .first()
      .click({ force: true });

    // Click the Download file button in the dropdown
    cy.contains("button", "Download file", { timeout: 3000 })
      .find("div")
      .click({ force: true });

    // Wait for the network request to complete
    cy.wait("@downloadRequest").then((interception) => {
      // Check that the download request was made successfully
      expect(interception.response.statusCode).to.equal(301);
    });
  });
});
