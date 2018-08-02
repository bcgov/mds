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

def configSlurper = new ConfigSlurper("build")
configSlurper.setBinding(['opt': opt])
def config = configSlurper.parse(new File(opt.c).toURI().toURL())

println config

config.app.namespaces.each {String key, Map env->
    println "Should we clean ${env.namespace}? ${env.disposable}"
    if (env.disposable == true){
        oc(['delete', 'all', '-l', "app=${config.app.name}-${key}-pr-${config.app.git.changeId}", '-n', "${env.namespace}"])
        oc(['delete', 'secret,configmap,pvc', '-l', "app=${config.app.name}-${key}-pr-${config.app.git.changeId}", '-n', "${env.namespace}"])

        Map ret = ocGet(['is', '-l', "app-name=${config.app.name}", '-n', "${env.namespace}"])
        for(Map imageStream:ret.items){
                oc(['delete', 'istag', "${imageStream.metadata.name}:${key}-pr-${config.app.git.changeId}", '--ignore-not-found=true', '-n', "${env.namespace}"])
        }
    }
}
