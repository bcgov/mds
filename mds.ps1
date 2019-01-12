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
make clean
write-host 'Building...'
docker-compose build --force-rm
write-host 'Spinning up containers...'
docker-compose up -d
write-host 'Waiting for keycloak server...'
#todo: replace this sleep with a check
Start-Sleep -seconds 30
write-host 'Creating admin user... (admin/admin)'
docker exec -it mds_keycloak /tmp/keycloak-local-user.sh
write-host 'frontend will be available at http://localhost:3000'
write-host 'backend will be available at http://localhost:5000'
write-host 'Postgresql will be available at http://localhost:5432'
write-host 'Wait up to 5min or longer for MDS webapp to be available.'
write-host 'If it loads with errors, wait longer for the backend to become available and refresh.'
