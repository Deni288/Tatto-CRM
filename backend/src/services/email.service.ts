import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

const FROM = 'Tattoo CRM <onboarding@resend.dev>';

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
                <p style="color: #94a3b8; margin-bottom: 24px;">Hi ${params.clientName},</p>
                <p>Your booking request has been received by <strong>${params.artistName}</strong>. We'll be in touch soon to confirm your appointment.</p>
                <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Request</p>
                    <p style="margin: 0 0 4px;"><strong>Idea:</strong> ${params.tattooIdea}</p>
                    <p style="margin: 0;"><strong>Preferred month:</strong> ${params.preferredMonth}</p>
                </div>
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
                <p style="color: #94a3b8; margin-bottom: 24px;">Hey ${params.artistName}, you have a new request!</p>
                <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Client Info</p>
                    <p style="margin: 0 0 4px;"><strong>Name:</strong> ${params.clientName}</p>
                    <p style="margin: 0 0 4px;"><strong>Email:</strong> ${params.clientEmail}</p>
                    <p style="margin: 0 0 4px;"><strong>Phone:</strong> ${params.clientPhone}</p>
                    <p style="margin: 0 0 4px;"><strong>Idea:</strong> ${params.tattooIdea}</p>
                    <p style="margin: 0;"><strong>Preferred month:</strong> ${params.preferredMonth}</p>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-top: 32px;">Log in to your Tattoo CRM dashboard to review and respond.</p>
            </div>
        `,
    });
};
