# Interview Talking Points

## 30-second project pitch

Timoa is a mobile-first booking platform for salons and barbers. I built public booking flows, an owner dashboard, appointment management, transactional emails, Stripe and PayPal payment flows, privacy-conscious analytics, owner onboarding and an internal pilot setup workflow. The project is especially relevant to automation roles because it turns a messy manual booking process into a structured, event-driven digital workflow.

## Why it fits n8n/workflow automation

- manual process analysis
- API/webhook integrations
- event-driven logic
- data mapping and transformation
- error states and monitoring thinking
- documentation and smoke tests
- GDPR/privacy-conscious analytics

## Honest n8n answer

Timoa itself is not built with n8n. I would position it as transferable automation engineering experience. The workflows could be modeled in n8n using triggers, HTTP/API nodes, code nodes, database nodes and error workflows.

## Strong example

The payment flow required mapping provider-specific states from Stripe and PayPal into internal payment and appointment states. This is similar to workflow automation work because the main challenge is not just calling an API, but designing reliable state transitions, retries, idempotency and clear user communication.

## Pilot learning

Real users immediately reveal issues that internal testing misses, especially mobile layout, account setup and unclear wording. That changed my view of automation: a workflow is only good if real users can operate around it.
