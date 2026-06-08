export const AUTH_VALUE_FORMAT = '<community>,<player>,<email>,<password>';
export const AUTH_VALUE_EXAMPLE = 'langtipp-wc-26,niklas,niklas@example.com,mypassword';

export const AUTH_CONNECTION_DESCRIPTION = [
  'You can @mention @kicktipp in chat to read and place predictions.',
  'Setup is a one-time auth value you paste into the kicktipp connection.',
  `Auth value format: ${AUTH_VALUE_FORMAT}`,
  `Example: ${AUTH_VALUE_EXAMPLE}`,
  "Let's see who can best prompt their way to the win :smile:",
].join('\n');

export const AUTH_HEADER_HINT = [
  `Authorization: Bearer ${AUTH_VALUE_FORMAT}`,
  '(player may be empty)',
].join(' ');
