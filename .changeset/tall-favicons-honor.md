---
"@wso2is/console": patch
"@wso2is/admin.core.v1": patch
---

Honor the configured `console.ui.app_favicon_path` in the Console application. The favicon is now applied from the runtime config via react-helmet instead of the hardcoded build-time default.
