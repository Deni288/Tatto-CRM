import crypto from 'crypto';
import { google } from 'googleapis';
import { env } from '../config/env';
import prisma from '../config/db';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

interface AppointmentForSync {
    readonly id: string;
    readonly title: string;
    readonly description: string | null;
    readonly startTime: Date;
    readonly endTime: Date;
    readonly googleEventId: string | null;
    readonly client: { readonly firstName: string; readonly lastName: string };
}

// --- Token Encryption ---

function getEncryptionKey(): Buffer {
    const key = env.GOOGLE_TOKEN_ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error('[Calendar] GOOGLE_TOKEN_ENCRYPTION_KEY must be 64 hex chars (32 bytes)');
    }
    return Buffer.from(key, 'hex');
}

export function encryptToken(token: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(encrypted: string): string {
    const key = getEncryptionKey();
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
        throw new Error('[Calendar] Invalid encrypted token format');
    }
    const [ivHex, authTagHex, dataHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');

    if (iv.length !== IV_LENGTH) {
        throw new Error('[Calendar] Invalid IV length');
    }
    if (authTag.length !== AUTH_TAG_LENGTH) {
        throw new Error('[Calendar] Invalid auth tag length');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(data) + decipher.final('utf8');
}

// --- OAuth Client ---

function createOAuth2Client(): InstanceType<typeof google.auth.OAuth2> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        throw new Error('[Calendar] Google OAuth credentials not configured');
    }
    const redirectUri = `${env.API_URL}/api/google-calendar/callback`;
    return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
}

export function getAuthUrl(state: string): string {
    const client = createOAuth2Client();
    return client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        state,
    });
}

export async function exchangeCodeForTokens(code: string): Promise<string> {
    const client = createOAuth2Client();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
        throw new Error('[Calendar] No refresh token received — user may need to re-authorize');
    }
    return tokens.refresh_token;
}

async function getAuthenticatedClient(
    artistId: string,
    encryptedRefreshToken: string,
): Promise<InstanceType<typeof google.auth.OAuth2>> {
    const client = createOAuth2Client();
    const refreshToken = decryptToken(encryptedRefreshToken);
    client.setCredentials({ refresh_token: refreshToken });

    // Handle token rotation
    client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
            const newEncrypted = encryptToken(tokens.refresh_token);
            prisma.user.update({
                where: { id: artistId },
                data: { googleRefreshToken: newEncrypted },
                select: { id: true },
            }).catch((err: unknown) => {
                console.error('[Calendar] Failed to save rotated refresh token:', err instanceof Error ? err.message : err);
            });
        }
    });

    return client;
}

// --- Calendar Sync ---

async function createEvent(artistId: string, appointment: AppointmentForSync): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: artistId },
        select: { googleRefreshToken: true, googleCalendarId: true },
    });
    if (!user?.googleRefreshToken) return;

    const auth = await getAuthenticatedClient(artistId, user.googleRefreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = user.googleCalendarId ?? 'primary';

    const event = await calendar.events.insert({
        calendarId,
        requestBody: {
            summary: `${appointment.title} — ${appointment.client.firstName} ${appointment.client.lastName}`,
            description: appointment.description ?? undefined,
            start: { dateTime: appointment.startTime.toISOString() },
            end: { dateTime: appointment.endTime.toISOString() },
        },
    });

    if (event.data.id) {
        await prisma.appointment.update({
            where: { id: appointment.id },
            data: { googleEventId: event.data.id },
            select: { id: true },
        });
    }
}

async function updateEvent(artistId: string, appointment: AppointmentForSync): Promise<void> {
    if (!appointment.googleEventId) return;

    const user = await prisma.user.findUnique({
        where: { id: artistId },
        select: { googleRefreshToken: true, googleCalendarId: true },
    });
    if (!user?.googleRefreshToken) return;

    const auth = await getAuthenticatedClient(artistId, user.googleRefreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = user.googleCalendarId ?? 'primary';

    await calendar.events.update({
        calendarId,
        eventId: appointment.googleEventId,
        requestBody: {
            summary: `${appointment.title} — ${appointment.client.firstName} ${appointment.client.lastName}`,
            description: appointment.description ?? undefined,
            start: { dateTime: appointment.startTime.toISOString() },
            end: { dateTime: appointment.endTime.toISOString() },
        },
    });
}

async function deleteEvent(artistId: string, googleEventId: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: artistId },
        select: { googleRefreshToken: true, googleCalendarId: true },
    });
    if (!user?.googleRefreshToken) return;

    const auth = await getAuthenticatedClient(artistId, user.googleRefreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = user.googleCalendarId ?? 'primary';

    await calendar.events.delete({ calendarId, eventId: googleEventId });
}

export async function syncAppointmentToCalendar(
    action: 'create' | 'update' | 'delete',
    artistId: string,
    appointment: AppointmentForSync,
): Promise<void> {
    try {
        switch (action) {
            case 'create':
                await createEvent(artistId, appointment);
                break;
            case 'update':
                await updateEvent(artistId, appointment);
                break;
            case 'delete':
                if (appointment.googleEventId) {
                    await deleteEvent(artistId, appointment.googleEventId);
                }
                break;
        }
    } catch (err: unknown) {
        console.error(
            `[Calendar] Sync ${action} failed for appointment ${appointment.id}:`,
            err instanceof Error ? err.message : err,
        );
    }
}
