#This is a slightly hacky powershell script
#It will wait until docker has started, and attempt to correctly build the MDS app

$timeout_minutes = 10
function Check-Port {
    param (
        [int]$port
    )
    $connection = New-Object System.Net.Sockets.TcpClient('localhost',$port)
    $connection.Connected
}

function Check-Docker {
    $ErrorActionPreference = "Stop"
    try{
        $garbage = docker ps
        $true
    }
    catch{
        $false
    }
    finally{
        $ErrorActionPreference = "Continue"
    }
}

$Running = Check-Docker
$count = 0
while ($Running -ne $true) {
    if($count -ge $timeout_minutes){
        write-host 'Timeout!'
        Exit-PSSession
    }
    write-host 'Waiting for Docker to start... (this may take a while)'
    Start-Sleep -seconds 60
    $Running = Check-Docker
    $count++
}
write-host 'Docker started...'
write-host 'Cleaning...'
$ErrorActionPreference = "Continue"
make rebuild-all-local
