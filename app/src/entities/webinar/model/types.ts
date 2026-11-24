export type WebinarStatus = 'upcoming' | 'live' | 'past';

export interface Webinar {
  id: string;
  title: string;
  speaker: string | null;
  speakerRole: string | null;
  startsAt: string | null;
  durationMin?: number;
  productId: string;
  cover?: string | null;
  eventUrl: string;
  recordingUrl?: string | null;
  registrationOpen?: boolean;
  singlePlanId?: string;
  statusOverride?: WebinarStatus;
  host?: string;
  format?: string | null;
  description?: string;
  topics?: string[];
  bio?: string;
}
