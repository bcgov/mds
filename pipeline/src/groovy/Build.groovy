import groovy.transform.BaseScript
import ca.bc.gov.devops.OpenShiftBuildHelper

@BaseScript ca.bc.gov.devops.BasicBuild _super

@groovy.transform.SourceURI URI sourceURI

runScript(sourceURI)

//println args
println 'Done!!'
