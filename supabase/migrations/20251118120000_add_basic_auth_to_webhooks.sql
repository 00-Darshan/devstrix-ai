/*
  # Add basic auth support to webhooks

  Adds auth_type and basic auth credential columns so each webhook can specify how
  requests should be authenticated when invoked from the app.
*/

ALTER TABLE webhooks
  ADD COLUMN auth_type text NOT NULL DEFAULT 'none';

ALTER TABLE webhooks
  ADD COLUMN basic_auth_username text NOT NULL DEFAULT '';

ALTER TABLE webhooks
  ADD COLUMN basic_auth_password text NOT NULL DEFAULT '';

ALTER TABLE webhooks
  ADD CONSTRAINT webhooks_auth_type_check
  CHECK (auth_type IN ('none', 'api_key', 'basic'));
