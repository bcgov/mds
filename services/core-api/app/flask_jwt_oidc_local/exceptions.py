# Copyright © 2021 thor wolpert
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# Format error response and append status code.
"""JWTManager exception and error classes."""


class AuthError(Exception):
    """Default exception class for this package."""

    def __init__(self, error, status_code):
        """Initialize the exception class."""
        super().__init__()
        self.error = error
        self.status_code = status_code
