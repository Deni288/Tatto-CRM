import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, ImagePlus, Upload } from 'lucide-react';
import { Label } from '../tremor/Label';
import { Button } from '../tremor/Button';
import { useGalleryStore } from '../../store/gallery.store';
import { api } from '../../api/axiosInstance';
import { gooeyToast } from 'goey-toast';
import axios from 'axios';

interface AddImageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
}

interface UploadSignature {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
}

export const AddImageModal = ({ open, onOpenChange, clientId }: AddImageModalProps) => {
    const { addImage } = useGalleryStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClose = (): void => {
        setPreviewUrl('');
        setSelectedFile(null);
        setDescription('');
        onOpenChange(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!selectedFile) {
            gooeyToast.error('Please select an image');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Get signed upload params from our backend
            const { data: params } = await api.get<UploadSignature>('/upload/signature');

            // 2. Upload directly to Cloudinary (bypasses our server)
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('api_key', params.apiKey);
            formData.append('timestamp', String(params.timestamp));
            formData.append('signature', params.signature);
            formData.append('folder', params.folder);

            const { data: cloudinaryData } = await axios.post<{
                secure_url: string;
                public_id: string;
            }>(
                `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
                formData
            );

            // 3. Save URL + publicId to our backend
            await addImage(clientId, {
                imageUrl: cloudinaryData.secure_url,
                description: description || undefined,
                cloudinaryPublicId: cloudinaryData.public_id,
            });

            gooeyToast.success('Image added to gallery!');
            handleClose();
        } catch {
            gooeyToast.error('Failed to upload image. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
                        <Dialog.Title className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <ImagePlus size={22} className="text-gold-500" />
                            Add Image
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-slate-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-slate-800">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                        {/* File picker */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Image *</Label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-slate-700 hover:border-gold-500/50 rounded-xl p-6 flex flex-col items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
                            >
                                <Upload size={24} className="text-gold-500/70" />
                                <span className="text-sm font-medium">
                                    {selectedFile ? selectedFile.name : 'Click to select image'}
                                </span>
                                <span className="text-xs text-slate-600">JPG, PNG, WEBP up to 10MB</span>
                            </button>
                        </div>

                        {/* Preview */}
                        {previewUrl && (
                            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Description (Optional)</Label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Sleeve sketch, back piece reference..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-colors"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/80">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                className="bg-slate-800 hover:bg-slate-700 text-white border-none"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !selectedFile}
                                className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold border-none min-w-[120px] flex justify-center"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Upload'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
