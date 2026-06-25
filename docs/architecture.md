# Architecture

## Overview

Timoa is a mobile-first booking platform for salons, barbers and beauty providers.

The system consists of:

- Public booking pages
- Owner dashboard
- Appointment management
- Payment flows
- Transactional email notifications
- Media storage
- Privacy-conscious analytics
- Owner onboarding
- Provider plan and revenue foundation

## Main flows

### Customer booking flow

1. Customer opens a public salon page.
2. Customer selects a service.
3. Customer selects date and time.
4. Customer enters contact details.
5. Customer selects a payment method.
6. Appointment is created.
7. Confirmation page is shown.
8. Transactional emails are sent.
9. Customer can manage, reschedule or cancel via secure link.

### Owner dashboard flow

1. Owner logs in.
2. Owner manages profile, services, team, opening hours, media and payment settings.
3. Owner reviews appointments.
4. Owner uses onboarding/checklists to prepare salon setup.
5. Owner monitors insights.

## Data model highlights

Core entities:

- User
- Salon
- Service
- StaffMember
- OpeningHour
- Appointment
- Payment
- Refund foundation
- SalonBillingSettings
- AnalyticsEvent
- PilotFeedback
