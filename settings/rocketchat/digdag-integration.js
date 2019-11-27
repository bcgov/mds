class Script {
  /**
   * @params {object} request
   */
  process_incoming_request({ request }) {
    let data = request.content;
    let attachmentColor = `#36A64F`;

    let isError = data.status === `FAIL`;
    let isRunning = data.status === `RUNNING`;
    if (isError) {
      attachmentColor = `#A63636`;
    }
    if (isRunning) {
      attachmentColor = `#dec23a`;
    }

    statusMsg = `Incoming webhook from [${data.namespace}](https://console.pathfinder.gov.bc.ca:8443/console/project/${data.namespace}/overview):`;

    if (isError) {
      statusMsg = `**${statusMsg}**`;
    }

    return {
      content: {
        text: statusMsg,
        attachments: [
          {
            text: `${data.message}`,
            color: attachmentColor
          }
        ]
      }
    };
  }
}
