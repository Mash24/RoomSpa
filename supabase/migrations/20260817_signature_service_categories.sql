-- Ensure signature/sensual services have the correct category in CMS.
-- Without this, sensual slugs default to 'classic' and appear in Wellness menus.

update public.services
set category = 'sensual'
where slug in (
  'nuru',
  'body-to-body',
  'yoni',
  'lingam',
  'tantric',
  'couples-sensual'
);
