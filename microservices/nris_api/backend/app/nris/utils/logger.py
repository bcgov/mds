from flask import current_app


#TODO validate this is working an intended on Openshift
def get_logger():
    if current_app:
        return current_app.logger
    else:
        return None