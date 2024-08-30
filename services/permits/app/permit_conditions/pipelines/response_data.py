from dataclasses import dataclass

@dataclass
class ResponseData:
    content: str
    cache_key: str