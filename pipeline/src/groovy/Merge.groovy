import org.kohsuke.github.*
import org.jenkinsci.plugins.workflow.cps.CpsScript
import com.cloudbees.jenkins.GitHubRepositoryName
import groovy.transform.BaseScript
import java.nio.file.Path
import java.nio.file.Paths
import groovy.cli.picocli.CliBuilder
import groovy.cli.picocli.OptionAccessor

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
println config

GHRepository repo=getGitHubRepository(repositoryUrl)
println repo