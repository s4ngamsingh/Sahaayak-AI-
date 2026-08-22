import { logNotification } from '../db/queries.ts';

export interface NotificationPayload {
  grievanceId: string;
  trackingNumber: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail?: string;
  fcmToken?: string;
  title: string;
  departmentName: string;
  status: string;
  officerName?: string;
  officerPhone?: string;
}

export async function dispatchMultiChannelNotifications(payload: NotificationPayload) {
  const results = {
    sms: false,
    whatsapp: false,
    email: false,
    push: false,
  };

  const statusLabel = payload.status.replace(/_/g, ' ');

  // 1. SMS Dispatch (Simulated & DB Logged)
  const smsContent = `[Samadhan AI] Your complaint ${payload.trackingNumber} is now ${statusLabel}. Dept: ${payload.departmentName}. SLA Monitored.`;
  await logNotification(payload.grievanceId, payload.citizenPhone, 'SMS', 'STATUS_UPDATE_SMS', smsContent, 'DELIVERED');
  results.sms = true;

  // 2. WhatsApp Dispatch
  const waContent = `🏛️ *Samadhan AI Municipal Update*\n\nNamaste ${payload.citizenName},\nYour civic grievance *#${payload.trackingNumber}* has been updated to *${statusLabel}*.\n\n📍 *Issue:* ${payload.title}\n🏢 *Department:* ${payload.departmentName}\n👮 *Officer:* ${payload.officerName || 'Nodal Squad 4'}\n\nTrack live: https://samadhan.gov.in/track/${payload.trackingNumber}`;
  await logNotification(payload.grievanceId, payload.citizenPhone, 'WHATSAPP', 'WHATSAPP_RICH_TEMPLATE', waContent, 'DELIVERED');
  results.whatsapp = true;

  // 3. Email Dispatch
  if (payload.citizenEmail) {
    const emailContent = `Official Notice: Status of Grievance ${payload.trackingNumber} has changed to ${statusLabel}. Assigned Department: ${payload.departmentName}.`;
    await logNotification(payload.grievanceId, payload.citizenEmail, 'EMAIL', 'OFFICIAL_CIVIC_EMAIL', emailContent, 'DELIVERED');
    results.email = true;
  }

  // 4. Push / Firebase Cloud Messaging (FCM)
  const fcmTarget = payload.fcmToken || 'fcm_broadcast_civic_device_token';
  const pushContent = `Grievance #${payload.trackingNumber}: ${statusLabel} (${payload.departmentName})`;
  await logNotification(payload.grievanceId, fcmTarget, 'PUSH', 'FCM_HIGH_PRIORITY', pushContent, 'DELIVERED');
  results.push = true;

  return results;
}
