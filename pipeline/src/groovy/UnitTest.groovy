import groovy.transform.BaseScript
import ca.bc.gov.devops.OpenShiftHelper
import java.nio.file.Path
import java.nio.file.Paths
import groovy.cli.picocli.CliBuilder
import groovy.cli.picocli.OptionAccessor
import static OpenShiftHelper.oc
import static OpenShiftHelper.ocGet

@groovy.transform.SourceURI URI scriptSourceUri

File scriptSourceFile = Paths.get(scriptSourceUri).toFile()

cli = new CliBuilder(usage: "groovy ${scriptSourceFile.getName()} --pr=<pull request#>")

cli.with {
    h(longOpt: 'help', 'Show usage information')
    c(longOpt: 'config', args: 1, argName: 'Pipeline config file', 'Pipeline config file', required: true)
    e(longOpt: 'env', args: 1, argName: 'Target environment name', 'Target environment name', required: true)
    b(longOpt: 'branch', args: 1, argName: 'Current branch name', 'Current branch name', required: true)
    _(longOpt: 'pr', args: 1, argName: 'Pull Request Number', 'GitHub Pull Request #', required: true)
}


opt = cli.parse(args)


if (opt == null) {
    //System.err << 'Error while parsing command-line options.\n'
    //cli.usage()
    System.exit 2
}

if (opt?.h) {
    cli.usage()
    return 0
}

def config = OpenShiftHelper.loadBuildConfig(opt)
def namespace = config.app.namespaces."${opt.env}".namespace
def branch = "${opt.branch}"
def appLabel = "${opt.env}-${config.app.build.env.id}"
def dbConfig = "${config.app.name}-postgresql-${config.app.build.env.id}"

def frontendIsName = "mds-frontend-${config.app.build.env.id}"
def frontendPublicIsName = "mds-frontend-public-${config.app.build.env.id}"

def frontEndDeploymentConfigs = ocGet(['is','-l', "app-name=${config.app.name},image-stream.name=${frontendIsName}", "--namespace=${namespace}"])
def frontEndPublicDeploymentConfigs = ocGet(['is','-l', "app-name=${config.app.name},image-stream.name=${frontendPublicIsName}", "--namespace=${namespace}"])
def backEndDeploymentConfigs = ocGet(['is','-l', "app-name=${config.app.name},image-stream.name=mds-python-backend", "--namespace=${namespace}"])
def nrisBackendDeploymentConfigs = ocGet(['is','-l', "app-name=${config.app.name},image-stream.name=mds-nris-backend", "--namespace=${namespace}"])
def docmanBackendDeploymentConfigs = ocGet(['is','-l', "app-name=${config.app.name},image-stream.name=mds-docman-backend", "--namespace=${namespace}"])


// Run frontend tests
frontEndDeploymentConfigs.items.each {Map object ->
    Map isTag = ocGet(["istag/${object.metadata.name}:${appLabel}", "--namespace=${namespace}"])
    OpenShiftHelper._exec(["bash", '-c', "oc process -f openshift/sonar.pod.json -l 'app=mds-${appLabel},sonar=${config.app.build.id}-${object.metadata.name}' -p 'NAME=sonar-${config.app.build.id}-${object.metadata.name}' -p 'IMAGE=${isTag.image.dockerImageReference}' -p 'DB_CONFIG_NAME=${dbConfig}' -p 'GIT_BRANCH=${branch}' -p 'CPU_LIMIT=1500m' --namespace=${object.metadata.namespace} |  oc replace -f - --namespace=${object.metadata.namespace} --force=true"], new StringBuffer(), new StringBuffer())
}

// Run backend tests
backEndDeploymentConfigs.items.each {Map object ->
    Map isTag = ocGet(["istag/${object.metadata.name}:${appLabel}", "--namespace=${namespace}"])
    OpenShiftHelper._exec(["bash", '-c', "oc process -f openshift/sonar.pod.json -l 'app=mds-${appLabel},sonar=${config.app.build.id}-${object.metadata.name}' -p 'NAME=sonar-${config.app.build.id}-${object.metadata.name}' -p 'IMAGE=${isTag.image.dockerImageReference}' -p 'DB_CONFIG_NAME=${dbConfig}' -p 'GIT_BRANCH=${branch}' --namespace=${object.metadata.namespace} |  oc replace -f - --namespace=${object.metadata.namespace} --force=true"], new StringBuffer(), new StringBuffer())
}

// Run public frontend tests
frontEndPublicDeploymentConfigs.items.each {Map object ->
    Map isTag = ocGet(["istag/${object.metadata.name}:${appLabel}", "--namespace=${namespace}"])
    OpenShiftHelper._exec(["bash", '-c', "oc process -f openshift/sonar.pod.json -l 'app=mds-${appLabel},sonar=${config.app.build.id}-${object.metadata.name}' -p 'NAME=sonar-${config.app.build.id}-${object.metadata.name}' -p 'IMAGE=${isTag.image.dockerImageReference}' -p 'DB_CONFIG_NAME=${dbConfig}' -p 'GIT_BRANCH=${branch}' -p 'CPU_LIMIT=1000m' --namespace=${object.metadata.namespace} |  oc replace -f - --namespace=${object.metadata.namespace} --force=true"], new StringBuffer(), new StringBuffer())
}

// Run nris api tests
nrisBackendDeploymentConfigs.items.each {Map object ->
    Map isTag = ocGet(["istag/${object.metadata.name}:${appLabel}", "--namespace=${namespace}"])
    OpenShiftHelper._exec(["bash", '-c', "oc process -f openshift/sonar.pod.json -l 'app=mds-${appLabel},sonar=${config.app.build.id}-${object.metadata.name}' -p 'NAME=sonar-${config.app.build.id}-${object.metadata.name}' -p 'IMAGE=${isTag.image.dockerImageReference}' -p 'DB_CONFIG_NAME=${dbConfig}' -p 'GIT_BRANCH=${branch}' --namespace=${object.metadata.namespace} |  oc replace -f - --namespace=${object.metadata.namespace} --force=true"], new StringBuffer(), new StringBuffer())
}

// Run nris api tests
docmanBackendDeploymentConfigs.items.each {Map object ->
    Map isTag = ocGet(["istag/${object.metadata.name}:${appLabel}", "--namespace=${namespace}"])
    OpenShiftHelper._exec(["bash", '-c', "oc process -f openshift/sonar.pod.json -l 'app=mds-${appLabel},sonar=${config.app.build.id}-${object.metadata.name}' -p 'NAME=sonar-${config.app.build.id}-${object.metadata.name}' -p 'IMAGE=${isTag.image.dockerImageReference}' -p 'DB_CONFIG_NAME=${dbConfig}' -p 'GIT_BRANCH=${branch}' --namespace=${object.metadata.namespace} |  oc replace -f - --namespace=${object.metadata.namespace} --force=true"], new StringBuffer(), new StringBuffer())
}


if (!OpenShiftHelper.waitForPodsToComplete(['pods','-l', "app=mds-${appLabel},sonar", "--namespace=${namespace}"])){
    System.exit(1)
}
