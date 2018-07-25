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


def deploymentConfigs = ocGet(['is','-l', "app-name=${config.app.name}",'-l',"component=mds-python-backend", "--namespace=${config.app.build.namespace}"])

deploymentConfigs.items.each {Map object ->
    println "Running TEST for ${OpenShiftHelper.guid(object)}"
    
    Map isTag = ocGet(["istag/${object.metadata.name}:${config.app.build.version}", "--namespace=${config.app.build.namespace}"])

    
    
    OpenShiftHelper._exec(["bash", '-c', "oc process -f openshift/sonar.pod.json -l 'app=${config.app.build.id}' -l 'sonar=${config.app.build.id}-${object.metadata.name}' -p 'NAME=sonar-${config.app.build.id}-${object.metadata.name}' -p 'IMAGE=${isTag.image.dockerImageReference}' --namespace=${object.metadata.namespace} |  oc replace -f - --namespace=${object.metadata.namespace} --force=true"], new StringBuffer(), new StringBuffer())
}

if (!OpenShiftHelper.waitForPodsToComplete(['pods','-l', "app=${config.build.id}", '-l', "sonar", "--namespace=${config.app.build.namespace}"])){
    System.exit(1)
}
