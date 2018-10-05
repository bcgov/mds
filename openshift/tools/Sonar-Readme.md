## SonarQube Branch analysis plugin

Starting version 6.7.1 the community edition of SonarQube doesn't include the branch analysis feature.
However, there is an alternative open sourced option available here: https://github.com/msanez/sonar-branch-community

### Installation Steps:

To install the plugin, follow the steps below:

1. Download the source code for the appropriate version of SonarQube installation. At the time writing this README, the project uses SonarQube 6.7.1 and hence will be using the [release 1.0.1](https://github.com/msanez/sonar-branch-community/releases/tag/1.0.1)

2. Compile the maven project and generate a .jar

3. Copy over the .jar over to the plugins directory of the currently running SonarQube pod in OpenShift under the tools project using oc.
For e.g.
`oc cp ./branch-1.0.1.jar sonar-pod-sh2j3j:/opt/sonarqube/extensions/plugins`

4. Use the SonarQube admin to restart the server.