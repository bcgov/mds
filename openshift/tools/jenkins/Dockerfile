FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

RUN wget -q http://mirrors.jenkins.io/war-stable/2.176.3/jenkins.war -O /usr/lib/jenkins/jenkins.war
RUN chmod 755 /usr/lib/jenkins/jenkins.war

USER 1001