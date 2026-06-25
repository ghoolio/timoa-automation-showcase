# Process Analysis

## Core business process

The main process is appointment booking for a salon/barber.

### Actors

- Customer
- Salon owner
- Timoa system
- Payment provider
- Email provider

### Inputs

- salon profile
- services
- service duration
- service price
- opening hours
- staff configuration
- customer booking details
- payment method

### Outputs

- appointment record
- customer confirmation
- owner notification
- dashboard appointment
- payment status
- manage link for customer
- aggregated insights

## Process risks

### Operational risks

- double bookings
- wrong opening hours
- wrong service duration
- owner does not see appointment
- customer does not receive confirmation

### Payment risks

- payment provider returns pending status
- webhook fails
- payment is completed but appointment is not updated
- refund expectations are unclear

### Privacy risks

- customer PII appears in analytics
- manage tokens are logged
- raw payment payloads are exposed

## Controls implemented or planned

- transactional email notifications
- payment status handling
- cancellation/refund policy copy
- privacy-conscious analytics metadata
- owner-only dashboard
- pilot smoke-test checklist
- manual pilot support loop

## Automation opportunities

These are possible n8n or workflow-automation candidates:

1. New appointment notification routing
2. Daily appointment summary for salon owner
3. Failed payment follow-up
4. Cancellation/refund manual review task
5. Weekly salon insights email
6. Internal pilot feedback collection
7. Support triage for bug reports/screenshots
