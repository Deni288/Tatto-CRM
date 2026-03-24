import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Image as ImageIcon, FileText, Calendar, Plus, Loader2, FileSignature, Trash2, Printer, MessageCircle, Link, Check } from 'lucide-react';
import { Card } from '../components/tremor/Card';
import { TabNavigation, TabNavigationLink } from '../components/tremor/TabNavigation';
import { Button } from '../components/tremor/Button';
import { useClientStore } from '../store/client.store';
import { useConsentStore } from '../store/consent.store';
import { useGalleryStore } from '../store/gallery.store';
import { NewConsentFormModal } from '../components/clients/NewConsentFormModal';
import { AddImageModal } from '../components/clients/AddImageModal';
import { EditClientModal } from '../components/clients/EditClientModal';
import { PrintableConsentForm } from '../components/clients/PrintableConsentForm';
import { gooeyToast } from 'goey-toast';

export const ClientDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'gallery' | 'appointments' | 'consents'>('info');
    const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [portalLinkCopied, setPortalLinkCopied] = useState(false);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const printRefs = useRef<(HTMLDivElement | null)[]>([]);

    const { selectedClient: client, isLoading, error, fetchClientById, deleteClient } = useClientStore();
    const { consentForms, fetchClientConsents, isLoading: isConsentsLoading } = useConsentStore();
    const { images: galleryImages, fetchGallery, deleteImage, isLoading: isGalleryLoading } = useGalleryStore();

    const handleDeleteClient = async () => {
        if (!id) return;
        const confirmed = window.confirm(
            'Are you sure you want to remove this client? Their records will be archived.'
        );
        if (!confirmed) return;
        try {
            await deleteClient(id);
            gooeyToast.success('Client has been archived successfully');
            navigate('/dashboard/clients');
        } catch {
            gooeyToast.error('Failed to archive client');
        }
    };

    useEffect(() => {
        if (id) {
            fetchClientById(id);
            fetchClientConsents(id);
            fetchGallery(id);
        }
    }, [id, fetchClientById, fetchClientConsents, fetchGallery]);

    const handleDeleteImage = async (imageId: string) => {
        if (!id) return;
        try {
            await deleteImage(id, imageId);
            gooeyToast.success('Image removed from gallery');
        } catch {
            gooeyToast.error('Failed to delete image');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-gold-500" />
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="max-w-5xl mx-auto pb-12 text-center py-20">
                <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Client Not Found</h2>
                <p className="text-slate-400 mb-6">{error || "The client you are looking for doesn't exist or you don't have permission to view them."}</p>
                <Button onClick={() => navigate('/dashboard/clients')} className="bg-gold-500 hover:bg-gold-400 text-slate-900 border-none">
                    Back to Clients
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <button
                onClick={() => navigate('/dashboard/clients')}
                className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Clients
            </button>

            <Card className="p-0 overflow-hidden mb-6">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-gold-500 font-bold text-3xl shrink-0 border-2 border-slate-700">
                            {client.firstName[0]}{client.lastName[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{client.firstName} {client.lastName}</h1>
                            <div className="flex flex-col sm:flex-row sm:items-center text-slate-400 gap-2 sm:gap-6 text-sm">
                                <span>{client.email || 'No email'}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-2">
                                    {client.phone || 'No phone'}
                                    {client.phone && (
                                        <button
                                            onClick={() => {
                                                const cleanPhone = client.phone!.replace(/[^0-9]/g, '');
                                                const aftercareText = 'Hvala na povjerenju! Evo uputa za njegu tetovaže: 1. Foliju drži 3 sata... 2. Peri blagim sapunom...';
                                                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(aftercareText)}`, '_blank');
                                            }}
                                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                                            title="Send aftercare instructions via WhatsApp"
                                        >
                                            <MessageCircle size={12} />
                                            Aftercare
                                        </button>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {client.portalToken && (
                            <Button
                                variant="secondary"
                                className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                                onClick={() => {
                                    const url = `${window.location.origin}/portal/${client.portalToken}`;
                                    void navigator.clipboard.writeText(url).then(() => {
                                        setPortalLinkCopied(true);
                                        setTimeout(() => setPortalLinkCopied(false), 2000);
                                    });
                                }}
                            >
                                {portalLinkCopied ? <Check size={18} className="mr-2 text-emerald-400" /> : <Link size={18} className="mr-2" />}
                                {portalLinkCopied ? 'Kopirano!' : 'Portal Link'}
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
                            <Edit3 size={18} className="mr-2" />
                            Edit Profile
                        </Button>
                        <Button
                            onClick={handleDeleteClient}
                            variant="secondary"
                            className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-500/40 transition-colors"
                        >
                            <Trash2 size={18} className="mr-2" />
                            Delete Client
                        </Button>
                    </div>
                </div>

                {/* Custom Tabs */}
                <div className="px-4 sm:px-8 border-b border-slate-800">
                    <TabNavigation className="gap-2">
                        {[
                            { id: 'info', label: 'Details & History', icon: FileText },
                            { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                            { id: 'appointments', label: 'Appointments', icon: Calendar },
                            { id: 'consents', label: 'Consent Forms', icon: FileSignature },
                        ].map((tab) => (
                            <TabNavigationLink
                                key={tab.id}
                                active={activeTab === tab.id}
                                onClick={(e) => { e.preventDefault(); setActiveTab(tab.id as any); }}
                                href="#"
                                className="flex items-center py-4 px-2 shrink-0"
                            >
                                <tab.icon size={18} className="mr-2 shrink-0" />
                                {tab.label}
                            </TabNavigationLink>
                        ))}
                    </TabNavigation>
                </div>

                <div className="p-6 md:p-8">
                    {activeTab === 'info' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Tattoo History</h3>
                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 text-slate-300">
                                    {client.tattooHistory || "No history provided."}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Custom Attributes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {client.customFields && Object.keys(client.customFields).length > 0 ? (
                                        Object.entries(client.customFields).map(([key, value]) => (
                                            <div key={key} className="bg-slate-950 p-4 rounded-lg border border-slate-800/50">
                                                <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="text-slate-200 font-medium">{String(value)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-2 text-slate-500 text-sm">No custom fields added yet.</p>
                                    )}
                                    <button className="border-2 border-dashed border-slate-800 rounded-lg p-4 flex items-center justify-center text-sm font-medium text-slate-500 hover:text-gold-500 hover:border-gold-500/50 transition-colors col-span-1 md:col-span-2 mt-2">
                                        <Plus size={18} className="mr-2" /> Add Custom Field
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">Reference Gallery</h3>
                                <Button 
                                    onClick={() => setIsGalleryModalOpen(true)}
                                    className="bg-gold-500 hover:bg-gold-400 text-slate-900 border-none"
                                >
                                    <Plus size={16} className="mr-1.5" /> Add Image
                                </Button>
                            </div>

                            {isGalleryLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                                </div>
                            ) : galleryImages && galleryImages.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {galleryImages.map(img => (
                                        <div key={img.id} className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all bg-slate-950 aspect-square">
                                            <img
                                                src={img.imageUrl}
                                                alt={img.description || 'Gallery image'}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0NzU1NjkiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';
                                                    (e.target as HTMLImageElement).className = 'w-16 h-16 object-contain opacity-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
                                                }}
                                            />
                                            {/* Hover overlay with delete */}
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                                                {img.description && (
                                                    <p className="text-white text-sm font-medium truncate mb-2">{img.description}</p>
                                                )}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-slate-400">{new Date(img.createdAt).toLocaleDateString()}</span>
                                                    <button
                                                        onClick={() => handleDeleteImage(img.id)}
                                                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed">
                                    <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-white font-medium mb-1">No images yet</h3>
                                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">Add reference images or finished work photos for this client.</p>
                                    <Button
                                        onClick={() => setIsGalleryModalOpen(true)}
                                        className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                                    >
                                        <Plus size={16} className="mr-1.5" /> Add First Image
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {client.appointments && client.appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {client.appointments.map(apt => (
                                        <div key={apt.id} className="bg-slate-950 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-colors group overflow-hidden">
                                            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-white text-lg group-hover:text-gold-500 transition-colors">{apt.title}</h4>
                                                    <div className="flex items-center text-sm text-slate-400 mt-1.5 space-x-2">
                                                        <Calendar size={14} className="text-slate-500" />
                                                        <span>
                                                            {new Date(apt.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} 
                                                            &nbsp;—&nbsp; 
                                                            {new Date(apt.endTime).toLocaleTimeString([], { timeStyle: 'short' })}
                                                        </span>
                                                    </div>
                                                    {apt.description && <p className="text-sm text-slate-500 mt-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">{apt.description}</p>}
                                                </div>
                                                <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3 pt-3 sm:pt-0 border-t border-slate-800 sm:border-0 mt-2 sm:mt-0">
                                                    <div className="text-gold-400 font-semibold text-lg bg-gold-500/5 px-3 py-1 rounded-lg border border-gold-500/10">
                                                        {apt.price ? `$${apt.price}` : '—'}
                                                    </div>
                                                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium tracking-wide uppercase ${
                                                        apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                                        apt.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                        {apt.status || 'SCHEDULED'}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Deposit / Balance info */}
                                            {(Number(apt.price) > 0 || Number((apt as any).deposit) > 0) && (
                                                <div className="flex items-center gap-4 px-5 py-2.5 border-t border-slate-800/50 text-xs">
                                                    <span className="text-slate-500">Total: <span className="text-slate-300 font-medium">€{Number(apt.price || 0).toFixed(0)}</span></span>
                                                    <span className="text-slate-500">Deposit: <span className="text-emerald-400 font-medium">€{Number((apt as any).deposit || 0).toFixed(0)}</span></span>
                                                    <span className="text-slate-500">Balance: <span className="text-gold-400 font-medium">€{(Number(apt.price || 0) - Number((apt as any).deposit || 0)).toFixed(0)}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed">
                                    <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-white font-medium mb-1">No appointments yet</h3>
                                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">This client doesn't have any booked appointments. Create a new booking to get started.</p>
                                    <Button variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700" onClick={() => document.dispatchEvent(new CustomEvent('open-new-booking-modal'))}>
                                        <Plus size={16} className="mr-2" /> Book Appointment
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'consents' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">Digital Consent Forms</h3>
                                <Button 
                                    onClick={() => setIsConsentModalOpen(true)}
                                    className="bg-gold-500 hover:bg-gold-400 text-slate-900 border-none"
                                >
                                    <Plus size={16} className="mr-1.5" /> New Consent Form
                                </Button>
                            </div>

                            {isConsentsLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                                </div>
                            ) : consentForms && consentForms.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {consentForms.map((form, formIdx) => (
                                        <div key={form.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-start mb-4 border-b border-slate-800/80 pb-3">
                                                <div className="flex items-center text-slate-300">
                                                    <FileSignature size={20} className="mr-2 text-gold-500" />
                                                    <span className="font-medium text-white">Signed Form</span>
                                                </div>
                                                <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                                                    {new Date(form.createdAt).toLocaleDateString()}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setTimeout(() => {
                                                            const el = printRefs.current[formIdx];
                                                            if (el) {
                                                                const printWindow = window.open('', '_blank');
                                                                if (printWindow) {
                                                                    printWindow.document.write(`
                                                                        <html>
                                                                        <head>
                                                                            <title>Consent Form - ${client.firstName} ${client.lastName}</title>
                                                                            <link href="https://fonts.googleapis.com/css2?family=Satisfy&display=swap" rel="stylesheet">
                                                                            <style>
                                                                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                                                                body { background: #fff; }
                                                                                @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
                                                                            </style>
                                                                        </head>
                                                                        <body>${el.innerHTML}</body>
                                                                        </html>
                                                                    `);
                                                                    printWindow.document.close();
                                                                    setTimeout(() => { printWindow.print(); }, 300);
                                                                }
                                                            }
                                                        }, 100);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-gold-500 hover:bg-slate-800 transition-colors"
                                                    title="Print / Save as PDF"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-3 pt-2 text-sm text-slate-400">
                                                <div>
                                                    <span className="block text-xs uppercase text-slate-500 mb-0.5">Medical Conditions</span>
                                                    <span className="text-slate-300">{form.medicalConditions || 'None reported'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs uppercase text-slate-500 mb-0.5">Allergies</span>
                                                    <span className="text-slate-300">{form.allergies || 'None reported'}</span>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-col">
                                                    <span className="text-xs text-emerald-500/80 uppercase font-medium tracking-wider mb-1">Digitally Signed By</span>
                                                    <span className="font-[Satisfy,cursive] italic text-xl text-gold-500/90">{form.signatureName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed">
                                    <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileSignature size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-white font-medium mb-1">No consent forms found</h3>
                                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">Collect digital signatures from your client before starting the session.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hidden printable forms */}
                    {client && consentForms && consentForms.map((form, idx) => (
                        <div key={`print-${form.id}`} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                            <PrintableConsentForm
                                ref={(el: HTMLDivElement | null) => { printRefs.current[idx] = el; }}
                                form={form}
                                clientName={`${client.firstName} ${client.lastName}`}
                            />
                        </div>
                    ))}
                </div>
            </Card>

            {client && (
                <NewConsentFormModal 
                    open={isConsentModalOpen} 
                    onOpenChange={setIsConsentModalOpen} 
                    clientId={client.id} 
                />
            )}

            {client && (
                <AddImageModal
                    open={isGalleryModalOpen}
                    onOpenChange={setIsGalleryModalOpen}
                    clientId={client.id}
                />
            )}

            {client && (
                <EditClientModal
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    client={client}
                />
            )}
        </div>
    );
};
