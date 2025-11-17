# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-17

### Added
- Initial release of Rotaptcha Node.js SDK
- Core `Rotaptcha` class for CAPTCHA verification
- Promise-based `verify()` method
- Callback-based `verifyCallback()` method
- Factory function `createClient()` for creating instances
- Support for custom API endpoints
- Comprehensive test suite with 10 test cases
- Detailed README with API documentation
- Usage examples for basic integration
- Express.js integration example
- MIT License
- .gitignore for Node.js projects

### Features
- HTTPS-based API communication
- Input validation for all parameters
- Error handling for network and API errors
- Support for remote IP address in verification
- Node.js >= 12.0.0 compatibility
