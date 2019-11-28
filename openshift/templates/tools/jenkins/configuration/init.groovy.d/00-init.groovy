import java.net.URL;
import java.nio.charset.StandardCharsets;


def runOrDie(command, String errorMessage){
    def process=command.execute()
    System.err.println(command)
    String processText = process.text
    def exitValue = process.waitFor()
    if (process.exitValue() != 0 ) throw new RuntimeException("${errorMessage} (exit value:${process.exitValue()})")
    return processText
}


System.err.println '---------------------\n|    INITIALIZING   \n---------------------'

String jenkinsConfigMapName=System.getenv()['JENKINS_CONFIGMAP_NAME']?:'jenkins'
String jenkinsConfigMapKey=System.getenv()['JENKINS_CONFIGMAP_KEY']?:'config'

String jenkinsConfigText = runOrDie(['oc', 'get', "configmaps/${jenkinsConfigMapName}", "--template={{.data.${jenkinsConfigMapKey}}}"], "'ConfigMaps/${jenkinsConfigMapName}' - '${jenkinsConfigMapKey}' was NOT found")
def jenkinsConfig = new groovy.json.JsonSlurper().parseText(jenkinsConfigText?:'{}')


System.err.println '---------------------\n|    Running Remote Script(S)   \n---------------------'
if (jenkinsConfig!=null && jenkinsConfig['init.url']!=null ){
    binding.setVariable('jenkinsConfig', jenkinsConfig)
    binding.setVariable('top', this)

    jenkinsConfig['init.url'].each { remoteUrl ->
        System.err.println "---------------------\n|    Running Remote Script: ${remoteUrl}   \n---------------------"
        URL url = new URL(remoteUrl.trim());
        HttpURLConnection connection = (HttpURLConnection)url.openConnection();
        connection.setRequestMethod("GET");
        connection.connect();

        if (connection.getResponseCode() ==  200){
            evaluate(connection.getInputStream().getText().trim())
        }else{
            System.err.println(">>>> Error reading ${remoteUrl} - ${connection.getResponseCode()}")
        }
        connection.disconnect();
    }
}


