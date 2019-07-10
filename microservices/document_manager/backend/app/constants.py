# Cache Timeouts
TIMEOUT_5_MINUTES = 300
TIMEOUT_60_MINUTES = 3600
TIMEOUT_24_HOURS = 86340
TIMEOUT_12_HOURS = 43140

# Cache keys
def FILE_UPLOAD_SIZE(document_guid): return f'document-manager:{document_guid}:file-size'
def FILE_UPLOAD_OFFSET(document_guid): return f'document-manager:{document_guid}:offset'
def FILE_UPLOAD_PATH(document_guid): return f'document-manager:{document_guid}:file-path'
def DOWNLOAD_TOKEN(token_guid): return f'document-manager:download-token:{token_guid}'

# Document Upload constants
TUS_API_VERSION = '1.0.0'
TUS_API_SUPPORTED_VERSIONS = '1.0.0'
FORBIDDEN_FILETYPES = ('js', 'php', 'pl', 'py', 'rb', 'sh', 'so', 'exe', 'dll')