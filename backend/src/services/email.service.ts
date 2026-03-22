import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

const FROM = 'Tattoo CRM <noreply@tattoocrm.app>';

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

export const sendVerificationEmail = async (params: {
    to: string;
    name: string;
    verificationUrl: string;
}): Promise<void> => {
    await resend.emails.send({
        from: FROM,
        to: params.to,
        subject: 'Confirm your Tattoo CRM account',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
                <h1 style="color: #d4af37; margin-bottom: 8px;">Confirm your account</h1>
                <p style="color: #94a3b8; margin-bottom: 24px;">Hi ${escapeHtml(params.name)},</p>
                <p>Thanks for signing up! Click the button below to confirm your email address and activate your account.</p>
                <a href="${params.verificationUrl}"
                   style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #d4af37; color: #0f172a; font-weight: 700; border-radius: 8px; text-decoration: none;">
                    Confirm Email
                </a>
                <p style="color: #64748b; font-size: 13px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
                <p style="color: #64748b; font-size: 12px; margin-top: 32px;">Tattoo CRM — powered by love for art</p>
            </div>
        `,
    });
};

export const sendAppointmentConfirmation = async (params: {
    to: string;
    clientName: string;
    artistName: string;
    title: string;
    startTime: Date;
    endTime: Date;
    portalUrl: string;
}): Promise<void> => {
    const dateStr = params.startTime.toLocaleDateString('hr-HR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const timeStr = `${params.startTime.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })} – ${params.endTime.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}`;

    await resend.emails.send({
        from: FROM,
        to: params.to,
        subject: `Termin zakazan: ${params.title}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
                <h1 style="color: #d4af37; margin-bottom: 8px;">Termin zakazan</h1>
                <p style="color: #94a3b8; margin-bottom: 24px;">Pozdrav ${escapeHtml(params.clientName)},</p>
                <p>Tvoj termin kod <strong>${escapeHtml(params.artistName)}</strong> je uspješno zakazan.</p>
                <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Detalji termina</p>
                    <p style="margin: 0 0 4px;"><strong>Naziv:</strong> ${escapeHtml(params.title)}</p>
                    <p style="margin: 0 0 4px;"><strong>Datum:</strong> ${dateStr}</p>
                    <p style="margin: 0;"><strong>Vrijeme:</strong> ${timeStr}</p>
                </div>
                <a href="${params.portalUrl}"
                   style="display: inline-block; margin: 8px 0 24px; padding: 12px 28px; background: #d4af37; color: #0f172a; font-weight: 700; border-radius: 8px; text-decoration: none;">
                    Pogledaj svoje podatke
                </a>
                <p style="color: #64748b; font-size: 12px; margin-top: 32px;">Tattoo CRM — powered by love for art</p>
            </div>
        `,
    });
};

export const sendBookingConfirmation = async (params: {
    to: string;
    clientName: string;
    artistName: string;
    tattooIdea: string;
    preferredMonth: string;
}): Promise<void> => {
    await resend.emails.send({
        from: FROM,
        to: params.to,
        subject: 'Booking Request Received',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
                <h1 style="color: #d4af37; margin-bottom: 8px;">Booking Request Received</h1>
                <p style="color: #94a3b8; margin-bottom: 24px;">Hi ${escapeHtml(params.clientName)},</p>
                <p>Your booking request has been received by <strong>${escapeHtml(params.artistName)}</strong>. We'll be in touch soon to confirm your appointment.</p>
                <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Request</p>
                    <p style="margin: 0 0 4px;"><strong>Idea:</strong> ${escapeHtml(params.tattooIdea)}</p>
                    <p style="margin: 0;"><strong>Preferred month:</strong> ${escapeHtml(params.preferredMonth)}</p>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-top: 32px;">Tattoo CRM — powered by love for art</p>
            </div>
        `,
    });
};

export const sendAppointmentReminder = async (params: {
    to: string;
    clientName: string;
    artistName: string;
    title: string;
    startTime: Date;
    endTime: Date;
    portalUrl: string;
}): Promise<void> => {
    const dateStr = params.startTime.toLocaleDateString('hr-HR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const timeStr = `${params.startTime.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })} – ${params.endTime.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}`;

    await resend.emails.send({
        from: FROM,
        to: params.to,
        subject: `Podsjetnik: Termin sutra — ${params.title}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
                <h1 style="color: #d4af37; margin-bottom: 8px;">Podsjetnik za termin</h1>
                <p style="color: #94a3b8; margin-bottom: 24px;">Pozdrav ${escapeHtml(params.clientName)},</p>
                <p>Podsjećamo te da imaš termin <strong>sutra</strong> kod <strong>${escapeHtml(params.artistName)}</strong>.</p>
                <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Detalji termina</p>
                    <p style="margin: 0 0 4px;"><strong>Naziv:</strong> ${escapeHtml(params.title)}</p>
                    <p style="margin: 0 0 4px;"><strong>Datum:</strong> ${dateStr}</p>
                    <p style="margin: 0;"><strong>Vrijeme:</strong> ${timeStr}</p>
                </div>
                <a href="${params.portalUrl}"
                   style="display: inline-block; margin: 8px 0 24px; padding: 12px 28px; background: #d4af37; color: #0f172a; font-weight: 700; border-radius: 8px; text-decoration: none;">
                    Pogledaj svoje podatke
                </a>
                <p style="color: #64748b; font-size: 12px; margin-top: 32px;">Tattoo CRM — powered by love for art</p>
            </div>
        `,
    });
};

export const sendNewBookingAlert = async (params: {
    to: string;
    artistName: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    tattooIdea: string;
    preferredMonth: string;
}): Promise<void> => {
    await resend.emails.send({
        from: FROM,
        to: params.to,
        subject: `New Booking Request from ${params.clientName}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
                <h1 style="color: #d4af37; margin-bottom: 8px;">New Booking Request</h1>
                <p style="color: #94a3b8; margin-bottom: 24px;">Hey ${escapeHtml(params.artistName)}, you have a new request!</p>
                <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Client Info</p>
                    <p style="margin: 0 0 4px;"><strong>Name:</strong> ${escapeHtml(params.clientName)}</p>
                    <p style="margin: 0 0 4px;"><strong>Email:</strong> ${escapeHtml(params.clientEmail)}</p>
                    <p style="margin: 0 0 4px;"><strong>Phone:</strong> ${escapeHtml(params.clientPhone)}</p>
                    <p style="margin: 0 0 4px;"><strong>Idea:</strong> ${escapeHtml(params.tattooIdea)}</p>
                    <p style="margin: 0;"><strong>Preferred month:</strong> ${escapeHtml(params.preferredMonth)}</p>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-top: 32px;">Log in to your Tattoo CRM dashboard to review and respond.</p>
            </div>
        `,
    });
};
