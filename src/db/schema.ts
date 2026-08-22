import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';

// 1. Users Table (Citizens, Nodal Officers, Municipal Admins)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or Auth Identifier
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  aadhaarLast4: text('aadhaar_last_4'),
  role: text('role').notNull().default('CITIZEN'), // 'CITIZEN' | 'OFFICER' | 'ADMIN'
  departmentId: text('department_id'), // PWD, WTR, ELEC, SWM, HLT, ENVR, POL
  designation: text('designation'),
  officerBadge: text('officer_badge'),
  isVerified: boolean('is_verified').default(false),
  fcmToken: text('fcm_token'),
  notificationPrefs: jsonb('notification_prefs').$type<{
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    push: boolean;
  }>().default({ sms: true, whatsapp: true, email: true, push: true }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Grievances (Complaints) Table
export const grievances = pgTable('grievances', {
  id: text('id').primaryKey(), // GRV-2026-PWD-XXXX
  trackingNumber: text('tracking_number').notNull().unique(),
  userId: text('user_id'), // Linked to users.uid
  citizenName: text('citizen_name').notNull(),
  citizenPhone: text('citizen_phone').notNull(),
  citizenEmail: text('citizen_email'),
  title: text('title').notNull(),
  rawCitizenInput: text('raw_citizen_input').notNull(),
  dictatedLanguage: text('dictated_language').default('English'),
  englishTranslation: text('english_translation'),
  departmentId: text('department_id').notNull(),
  category: text('category').notNull(),
  urgency: text('urgency').notNull().default('MEDIUM'), // 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
  status: text('status').notNull().default('SUBMITTED'), // 'SUBMITTED' | 'AI_TRIAGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED'
  locality: text('locality').notNull(),
  wardNo: text('ward_no').default('Ward 12'),
  landmark: text('landmark'),
  pincode: text('pincode'),
  lat: text('lat'),
  lng: text('lng'),
  assignedOfficerName: text('assigned_officer_name'),
  assignedOfficerPhone: text('assigned_officer_phone'),
  assignedOfficerBadge: text('assigned_officer_badge'),
  slaDeadline: timestamp('sla_deadline'),
  resolvedAt: timestamp('resolved_at'),
  photoUrl: text('photo_url'), // Stored via Firebase Storage
  audioUrl: text('audio_url'), // Stored citizen voice memo via Firebase Storage
  citizenFeedbackRating: integer('citizen_feedback_rating'),
  citizenFeedbackText: text('citizen_feedback_text'),
  aiConfidenceScore: integer('ai_confidence_score').default(95),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Grievance Timeline Events (Lifecycle Audit Trail)
export const grievanceTimeline = pgTable('grievance_timeline', {
  id: serial('id').primaryKey(),
  grievanceId: text('grievance_id')
    .references(() => grievances.id)
    .notNull(),
  stage: text('stage').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 4. Grievance Messages (Live Citizen <-> Officer Communication Thread)
export const grievanceMessages = pgTable('grievance_messages', {
  id: serial('id').primaryKey(),
  grievanceId: text('grievance_id')
    .references(() => grievances.id)
    .notNull(),
  sender: text('sender').notNull(), // 'CITIZEN' | 'OFFICER' | 'AI_SAHAYAK'
  senderName: text('sender_name').notNull(),
  message: text('message').notNull(),
  attachmentUrl: text('attachment_url'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 5. Multi-Channel Notifications Audit Log (SMS, WhatsApp, Email, Push FCM)
export const notificationsLog = pgTable('notifications_log', {
  id: serial('id').primaryKey(),
  grievanceId: text('grievance_id'),
  recipient: text('recipient').notNull(), // Phone or Email or FCM token
  channel: text('channel').notNull(), // 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH'
  templateName: text('template_name').notNull(),
  content: text('content').notNull(),
  status: text('status').notNull().default('SENT'), // 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED'
  sentAt: timestamp('sent_at').defaultNow(),
});

// 6. OTP Verification Cache / Ledger (Aadhaar & Mobile OTP)
export const otpLedger = pgTable('otp_ledger', {
  id: serial('id').primaryKey(),
  identifier: text('identifier').notNull(), // Mobile number or Aadhaar
  otpCode: text('otp_code').notNull(),
  type: text('type').notNull(), // 'MOBILE_OTP' | 'AADHAAR_OTP'
  isVerified: boolean('is_verified').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Drizzle Relations
export const grievancesRelations = relations(grievances, ({ many }) => ({
  timeline: many(grievanceTimeline),
  messages: many(grievanceMessages),
  notifications: many(notificationsLog),
}));

export const timelineRelations = relations(grievanceTimeline, ({ one }) => ({
  grievance: one(grievances, {
    fields: [grievanceTimeline.grievanceId],
    references: [grievances.id],
  }),
}));

export const messagesRelations = relations(grievanceMessages, ({ one }) => ({
  grievance: one(grievances, {
    fields: [grievanceMessages.grievanceId],
    references: [grievances.id],
  }),
}));
