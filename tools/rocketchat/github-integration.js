/* 
  Enhanced version of script from:
  - https://rocket.chat/docs/administrator-guides/integrations/github/#example-script-1
  2019.04.09 - Added support for new event (method) types:
    - pull_request_review_comment
    - check_run
    - status
*/

String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const getLabelsField = labels => {
  let labelsArray = [];
  labels.forEach(function(label) {
    labelsArray.push(label.name);
  });
  labelsArray = labelsArray.join(", ");
  return {
    title: "Labels",
    value: labelsArray,
    short: labelsArray.length <= 40
  };
};

const githubEvents = {
  ping(request) {
    return {
      content: {
        text:
          "_" +
          request.content.hook.id +
          "_\n" +
          ":thumbsup: " +
          request.content.zen
      }
    };
  },

  /* NEW OR MODIFY ISSUE */
  //   issues(request) {
  //     const user = request.content.sender;

  //     if (request.content.action == "opened" || request.content.action == "reopened" || request.content.action == "edited") {
  //       var body = request.content.issue.body;
  //     } else if (request.content.action == "labeled") {
  //       var body = "Current labels: " + getLabelsField(request.content.issue.labels).value;
  //     } else if (request.content.action == "assigned" || request.content.action == "unassigned") {
  //       // Note that the issues API only gives you one assignee.
  //       var body = "Current assignee: " + request.content.issue.assignee.login;
  //     } else if (request.content.action == "closed") {
  //       if (request.content.issue.closed_by) {
  //         var body = "Closed by: " + request.content.issue.closed_by.login;
  //       } else {
  //         var body = "Closed.";
  //       }
  //     } else {
  //       return {
  //         error: {
  //           success: false,
  //           message: 'Unsupported issue action'
  //         }
  //       };
  //     }

  //     const action = request.content.action.capitalizeFirstLetter();

  //     const text = '_' + request.content.repository.full_name + '_\n' +
  //       '**[' + action + ' issue ​#' + request.content.issue.number +
  //       ' - ' + request.content.issue.title + '](' +
  //       request.content.issue.html_url + ')**\n\n' +
  //       body;

  //     return {
  //       content: {
  //         attachments: [
  //           {
  //             thumb_url: user.avatar_url,
  //             text: text,
  //             fields: []
  //           }
  //         ]
  //       }
  //     };
  //   },

  /* COMMENT ON EXISTING ISSUE */
  //   issue_comment(request) {
  //     const user = request.content.comment.user;

  //     if (request.content.action == "edited") {
  //       var action = "Edited comment ";
  //     } else {
  //       var action = "Comment "
  //     }

  //     const text = '_' + request.content.repository.full_name + '_\n' +
  //       '**[' + action + ' on issue ​#' + request.content.issue.number +
  //       ' - ' + request.content.issue.title + '](' +
  //       request.content.comment.html_url + ')**\n\n' +
  //       request.content.comment.body;

  //     return {
  //       content: {
  //         attachments: [
  //           {
  //             thumb_url: user.avatar_url,
  //             text: text,
  //             fields: []
  //           }
  //         ]
  //       }
  //     };
  //   },

  /* COMMENT ON COMMIT */
  //   commit_comment(request) {
  //     const user = request.content.comment.user;

  //     if (request.content.action == "edited") {
  //       var action = "Edited comment ";
  //     } else {
  //       var action = "Comment "
  //     }

  //     const text = '_' + request.content.repository.full_name + '_\n' +
  //       '**[' + action + ' on commit id ' + request.content.comment.commit_id +
  //       ' - ' + + '](' +
  //       request.content.comment.html_url + ')**\n\n' +
  //       request.content.comment.body;

  //     return {
  //       content: {
  //         attachments: [
  //           {
  //             thumb_url: user.avatar_url,
  //             text: text,
  //             fields: []
  //           }
  //         ]
  //       }
  //     };
  //   },
  /* END OF COMMENT ON COMMIT */

  /* PUSH TO REPO */
  //   push(request) {
  //     var commits = request.content.commits;
  //     if (commits.length < 1 && typeof request.content.head_commit !== 'undefined') {
  //       commits.push(request.content.head_commit);
  //     }

  //     var multi_commit = ""
  //     var is_short = true;
  //     var changeset = 'Changeset';
  //     if (commits.length > 1) {
  //       var multi_commit = " [Multiple Commits]";
  //       var is_short = false;
  //       var changeset = changeset + 's';
  //       var output = [];
  //     }
  //     const user = request.content.sender;

  //     var text = '**Pushed to ' + "[" + request.content.repository.full_name + "](" + request.content.repository.url + "):"
  //       + request.content.ref.split('/').pop() + "**\n\n";

  //     for (var i = 0; i < commits.length; i++) {
  //       var commit = commits[i];
  //       var shortID = commit.id.substring(0, 7);
  //       var a = '[' + shortID + '](' + commit.url + ') - ' + commit.message;
  //       if (commits.length > 1) {
  //         output.push(a);
  //       } else {
  //         var output = a;
  //       }
  //     }

  //     if (commits.length > 1) {
  //       text += output.reverse().join('\n');
  //     } else {
  //       text += output;
  //     }

  //     return {
  //       content: {
  //         attachments: [
  //           {
  //             thumb_url: user.avatar_url,
  //             text: text,
  //             fields: []
  //           }
  //         ]
  //       }
  //     };
  //   },  // End GitHub Push

  /* NEW PULL REQUEST */
  pull_request(request) {
    const user = request.content.sender;

    var body = null;

    switch (request.content.action) {
      case "opened":
        body = request.content.pull_request.body;
        break;
      case "closed":
        if (request.content.pull_request.merged)
          body = "Merged by: " + request.content.pull_request.merged_by.login;
        else body = "Closed.";
        break;
      default:
        return null;
    }

    const action = request.content.action.capitalizeFirstLetter();

    const text =
      "_" +
      request.content.repository.full_name +
      "_\n" +
      "**[" +
      action +
      " pull request ​#" +
      request.content.pull_request.number +
      " - " +
      request.content.pull_request.title +
      "](" +
      request.content.pull_request.html_url +
      ")**\n\n" +
      body;

    return {
      content: {
        attachments: [
          {
            thumb_url: user.avatar_url,
            text: text,
            fields: []
          }
        ]
      }
    };
  },
  /* END OF NEW PULL REQUEST */

  /* PULL REQUEST REVIEW COMMENT */
  //   pull_request_review_comment(request) {
  //     const user = request.content.comment.user;

  //     if (request.content.action == "edited") {
  //       var action = "Edited comment ";
  //     } else {
  //       var action = "Comment "
  //     }

  //     const text = '_' + request.content.repository.full_name + '_\n' +
  //       '**[' + action + ' on pull request ​#' + request.content.pull_request.number +
  //       ' - ' + request.content.pull_request.title + '](' +
  //       request.content.comment.html_url + ')**\n\n' +
  //       request.content.comment.body;

  //     return {
  //       content: {
  //         attachments: [
  //           {
  //             thumb_url: user.avatar_url,
  //             text: text,
  //             fields: []
  //           }
  //         ]
  //       }
  //     };
  //   },
  /* END OF PULL REQUEST REVIEW COMMENT */

  //   /* CHECK RUN */
  //   check_run(request) {
  //     const user = request.content.check_run.app.owner;

  //     if (request.content.action == "created" && request.content.check_run.conclusion == "action_required") {
  //       var action = " action required.";
  //     } else {
  //       return {
  //         error: {
  //           success: false,
  //           message: `Unsupported check run action/conclusion: ${request.content.action}/${request.content.check_run.conclusion}`
  //         }
  //       };
  //     }

  //     const text = '_' + request.content.repository.full_name + '_\n' +
  //       '**[' + request.content.check_run.name + action + '](' +
  //       request.content.check_run.html_url + ')**\n\n' +
  //       request.content.check_run.output.summary;

  //     return {
  //       content: {
  //         attachments: [
  //           {
  //             thumb_url: user.avatar_url,
  //             text: text,
  //             fields: []
  //           }
  //         ]
  //       }
  //     };
  //   },
  /* END OF CHECK RUN */

  /* STATUS */
  //   status(request) {
  //     const user = request.content.commit.author;

  //     if (request.content.state == "failure") {
  //       var action = ", triggered the following status failure;";
  //     } else {
  //       return {
  //         error: {
  //           success: false,
  //           message: `Unsupported status state: ${request.content.state}`
  //         }
  //       };
  //     }

  //     const text = '_' + request.content.repository.full_name + '_\n' +
  //       '**[' + request.content.commit.commit.message + '](' +
  //       request.content.commit.html_url + ')**' +
  //       action +  '\n\n' +
  //       '[' + request.content.context + ' - ' + request.content.description + '](' + request.content.target_url + ')';

  //     return {
  //       content: {
  //         attachments: [
  //           {
  //             thumb_url: user.avatar_url,
  //             text: text,
  //             fields: []
  //           }
  //         ]
  //       }
  //     };
  //   },
  /* END OF STATUS */

  /* RELEASE */
  //   release(request) {
  //     const user = request.content.release.author;

  //     if (request.content.action == "published") {
  //       var body = request.content.release.body;
  //     } else {
  //       return {
  //         error: {
  //           success: false,
  //           message: `Unsupported action: ${request.content.action}`
  //         }
  //       };
  //     }

  //     const action = request.content.action.capitalizeFirstLetter();

  //     const text = '_' + request.content.repository.full_name + '_\n' +
  //       '**[' + action + ' release - ' + request.content.release.name + '](' +
  //       request.content.release.html_url + ')**\n\n' +
  //       body;

  //     return {
  //       content: {
  //         attachments: [
  //           {
  //             thumb_url: user.avatar_url,
  //             text: text,
  //             fields: []
  //           }
  //         ]
  //       }
  //     };
  //   },
  /* END OF RELEASE */

  /* FORK */
  //   fork(request) {
  //     const user = request.content.forkee.owner;
  //     const text = '_' + request.content.repository.full_name + '_\n' +
  //       '**[Forked by ' + user.login + '](' +
  //       request.content.forkee.html_url + ')**\n\n'

  //     return {
  //       content: {
  //         attachments: [
  //           {
  //             thumb_url: user.avatar_url,
  //             text: text,
  //             fields: []
  //           }
  //         ]
  //       }
  //     };
  //   },
  /* END OF FORK */

  /* repository_vulnerability_alert */
  repository_vulnerability_alert(request) {
    const user = request.content.sender;
    const alert = request.content.alert;
    const action =
      "Repository vulnerability alert " + request.content.action + "d";

    const text =
      "**" +
      action +
      ":**\n" +
      "**[" +
      alert.external_identifier +
      "](" +
      alert.external_reference +
      ")**\n" +
      "Affected package: " +
      alert.affected_package_name +
      " " +
      alert.affected_range +
      "\n" +
      "Fixed in: " +
      alert.fixed_in;

    return {
      content: {
        attachments: [
          {
            thumb_url: user.avatar_url,
            text: text,
            fields: []
          }
        ]
      }
    };
  }
  /* END OF repository_vulnerability_alert */
};

class Script {
  process_incoming_request({ request }) {
    const header = request.headers["x-github-event"];
    if (githubEvents[header]) {
      return githubEvents[header](request);
    }

    return {
      error: {
        success: false,
        message: `Unsupported method: ${header}`
      }
    };
  }
}
