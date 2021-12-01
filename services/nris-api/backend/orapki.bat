@echo off
rem original: https://ogobrecht.com/posts/2020-07-29-how-to-use-mkstore-and-orapki-with-oracle-instant-client/
rem inspiration: https://andriydmytrenko.wordpress.com/2013/07/01/using-the-secure-external-password-store-with-instant-client/

setlocal

rem get the command line arguments
set args=
:loop
  if !%1==! goto :done
  set args=%args% %1
  shift
  goto :loop
:done

rem set classpath for orapki - align this to your local SQLcl installation
set sqlcl=c:\oracle\sqlcl\sqlcl\lib
set classpath=%sqlcl%\oraclepki.jar
set classpath=%classpath%;%sqlcl%\osdt_core.jar
set classpath=%classpath%;%sqlcl%\osdt_cert.jar

rem simulate orapki command
java -classpath %classpath% oracle.security.pki.textui.OraclePKITextUI %args%

endlocal