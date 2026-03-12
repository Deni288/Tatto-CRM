import { forwardRef } from 'react';

interface ConsentFormData {
    id: string;
    medicalConditions: string | null;
    allergies: string | null;
    agreedToTerms: boolean;
    signatureName: string;
    createdAt: string;
}

interface PrintableConsentFormProps {
    form: ConsentFormData;
    clientName: string;
}

export const PrintableConsentForm = forwardRef<HTMLDivElement, PrintableConsentFormProps>(
    ({ form, clientName }, ref) => {
        return (
            <div ref={ref} className="hidden print:block">
                <div style={{
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    color: '#111',
                    background: '#fff',
                    padding: '48px 56px',
                    maxWidth: '800px',
                    margin: '0 auto',
                    lineHeight: 1.6,
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '3px double #333', paddingBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '1px', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                            Tattoo Consent &amp; Waiver Form
                        </h1>
                        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                            This document serves as a legally binding agreement between the client and the tattoo artist.
                        </p>
                    </div>

                    {/* Client Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', gap: '24px' }}>
                        <div>
                            <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', margin: '0 0 4px 0', letterSpacing: '1px' }}>Client Name</p>
                            <p style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{clientName}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', margin: '0 0 4px 0', letterSpacing: '1px' }}>Date Signed</p>
                            <p style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                                {new Date(form.createdAt).toLocaleDateString('en-GB', {
                                    day: '2-digit', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div style={{ marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '8px', margin: '0 0 12px 0', letterSpacing: '1px' }}>
                            Medical Information
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#999', margin: '0 0 4px 0' }}>Medical Conditions</p>
                                <p style={{ fontSize: '14px', margin: 0, padding: '8px 12px', background: '#f8f8f8', borderRadius: '6px', border: '1px solid #eee', minHeight: '36px' }}>
                                    {form.medicalConditions || 'None reported'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#999', margin: '0 0 4px 0' }}>Known Allergies</p>
                                <p style={{ fontSize: '14px', margin: 0, padding: '8px 12px', background: '#f8f8f8', borderRadius: '6px', border: '1px solid #eee', minHeight: '36px' }}>
                                    {form.allergies || 'None reported'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '8px', margin: '0 0 12px 0', letterSpacing: '1px' }}>
                            Terms &amp; Conditions
                        </h2>
                        <div style={{ fontSize: '12px', color: '#444', lineHeight: 1.8, padding: '12px 16px', background: '#fafafa', borderRadius: '6px', border: '1px solid #eee' }}>
                            <p style={{ margin: '0 0 8px 0' }}>By signing this form, I confirm and agree to the following:</p>
                            <ol style={{ margin: '0', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '6px' }}>I am at least 18 years of age and have valid photo identification.</li>
                                <li style={{ marginBottom: '6px' }}>I am not under the influence of alcohol or drugs at the time of this procedure.</li>
                                <li style={{ marginBottom: '6px' }}>I have been informed of the risks associated with tattooing, including infection, allergic reactions, scarring, and the possibility that the tattoo outcome may differ from expectations.</li>
                                <li style={{ marginBottom: '6px' }}>I have disclosed all relevant medical conditions, allergies, and medications to the artist.</li>
                                <li style={{ marginBottom: '6px' }}>I understand that tattoos are permanent and that removal is costly and may not fully restore the skin to its original condition.</li>
                                <li style={{ marginBottom: '6px' }}>I agree to follow all aftercare instructions provided by the artist to ensure proper healing.</li>
                                <li style={{ marginBottom: '6px' }}>I release the artist and studio from any claims, damages, or liability arising from this procedure.</li>
                            </ol>
                        </div>
                    </div>

                    {/* Agreement Confirmation */}
                    <div style={{ marginBottom: '36px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#166534', margin: 0 }}>
                            ✓ The client has agreed to all terms and conditions listed above.
                        </p>
                    </div>

                    {/* Signature */}
                    <div style={{ borderTop: '2px solid #333', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', margin: '0 0 8px 0', letterSpacing: '1px' }}>Digital Signature</p>
                            <p style={{ fontFamily: "'Satisfy', 'Segoe Script', cursive", fontSize: '32px', margin: 0, color: '#1a1a1a' }}>
                                {form.signatureName}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', margin: '0 0 8px 0', letterSpacing: '1px' }}>Date</p>
                            <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                                {new Date(form.createdAt).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '10px', color: '#aaa', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                        <p style={{ margin: 0 }}>
                            This consent form was digitally signed and is legally valid. Generated by Tattoo CRM.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
);
