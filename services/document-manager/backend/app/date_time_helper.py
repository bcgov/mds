from datetime import datetime

def get_formatted_current_time():
    return datetime.now().strftime("%d/%b/%Y %H:%M:%S")