export type Recipient = {
  email: string;
  firstName?: string;
  lastName?: string;
  committee?: string;
};

export type SendMode = 'individual' | 'bcc';

export type EmailPayload = {
  subject: string;
  html: string;
  recipients: Recipient[];
  mode: SendMode;
  fromName?: string;
  replyTo?: string;
  cc?: string;
  bcc?: string;
};
