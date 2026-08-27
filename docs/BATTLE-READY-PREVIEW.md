# Battle-ready sales preview

The September event page supports a visual sales preview at:

`/ekb-2026-09-26?preview=sales`

Purpose:

- show the exact open-registration composition before the final launch configuration is resolved;
- keep `TODO_*` values internal and out of the public page;
- never bypass the real `/api/register` readiness gate;
- never send preview leads or preview conversion analytics;
- keep the normal event URL honest and fail-closed until registration is genuinely ready.

The preview is presentation-only. Submitting the preview form does not call `/api/register`.

The normal page remains the source of truth for public availability. Missing organizer phone, privacy contact, branded domain, analytics, hall, entry instructions, partners or social links remain tracked through the launch placeholder registry and readiness checks.
