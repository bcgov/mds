<#
.SYNOPSIS
  <Overview of script>
.DESCRIPTION
  <Brief description of script>
.PARAMETER <Parameter_Name>
    <Brief description of parameter input required. Repeat this attribute if required>
.INPUTS
  <Inputs if any, otherwise state None>
.OUTPUTS
  <Outputs if any, otherwise state None - example: Log file stored in C:\Windows\Temp\<name>.log>
.NOTES
  Version:        1.0
  Author:         <Name>
  Creation Date:  <Date>
  Purpose/Change: Initial script development
  
.EXAMPLE
  <Example goes here. Repeat this attribute for more than one example>
#>

[CmdletBinding()]

PARAM ( 
    [string]$namespace = 'empr-mds-test'
)

# Consider adding some comment based help for the script here.

#-------------------------------------------------------------[Setup]------------------=-------------------------------------------
#Set Error Action to Silently Continue
$ErrorActionPreference = "SilentlyContinue"


#-----------------------------------------------------------[Functions]------------------------------------------------------------

Function GetPodSuffix {
    return $namespace | sls -Pattern 'test|prod' | % {$_.Matches[0].Value}
}


#-----------------------------------------------------------[Execution]------------------------------------------------------------

$suffix = GetPodSuffix
$selector = "mds-postgresql-$suffix-[0-9]+-[a-z0-9]+"

oc project $namespace

$podname = oc get pods | sls -Pattern $selector | % {$_.Matches[0].Value}

oc port-forward $podname 15432:5432