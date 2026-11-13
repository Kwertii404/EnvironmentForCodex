## 8. Remaining bugs, limitations and next steps

No unresolved failure was observed in the 33 named automated checks after the fix. This does not establish that the application is bug-free. The following limitations are known and should be disclosed during the demonstration.

| Area | Remaining limitation / next step |
| --- | --- |
| User validation | Recruit three representative participants, execute the tasks, retain feedback, prioritize findings and retest improvements. |
| Deployment | Local classroom app only; no real barangay connection, dispatching, service-level promise or production hosting. |
| Accounts | No OTP/mobile verification, password recovery or staff-account management interface. |
| Data handling | No submitted-report editing/deletion, retention policy, backup/restore workflow, or photo metadata stripping. Raw photo content is not comprehensively decoded/scanned. |
| Drafts and updates | Draft survives in-page navigation and network failure, but refresh clears it. Updates require refresh; no SMS/push notifications. |
| Location and compatibility | GPS depends on permissions and a secure context. Manual location remains available. Test actual phones and other browsers next. |
| Production robustness | Add pagination, deployment-specific rate limiting/session hardening, moderation, auditing and a formal security/accessibility review before public use. |