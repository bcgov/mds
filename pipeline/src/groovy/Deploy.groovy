import groovy.transform.BaseScript
import ca.bc.gov.devops.OpenShiftBuildHelper

@BaseScript ca.bc.gov.devops.BasicDeploy _super

@groovy.transform.SourceURI URI sourceURI

runScript(sourceURI)

println 'Done!!'
