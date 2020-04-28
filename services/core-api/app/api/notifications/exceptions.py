

class SerializationException(Exception):

    '''
    Raised when encountering invalid data for serialization
    '''
    pass

class ActivityNotFound(Exception):

    '''
    Raised when the activity is not present in the aggregated Activity
    '''
    pass
