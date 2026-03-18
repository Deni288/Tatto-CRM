import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, ImagePlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gallerySchema, type GalleryFormData } from '@tattoocrm/shared';
import { Input } from '../tremor/Input';
import { Label } from '../tremor/Label';
import { Button } from '../tremor/Button';
import { useGalleryStore } from '../../store/gallery.store';
import { gooeyToast } from 'goey-toast';

interface AddImageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
}

export const AddImageModal = ({ open, onOpenChange, clientId }: AddImageModalProps) => {
    const { addImage } = useGalleryStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<GalleryFormData>({
        resolver: zodResolver(gallerySchema),
        defaultValues: { imageUrl: '', description: '' },
    });

    const watchedUrl = watch('imageUrl');

    const onSubmit = async (data: GalleryFormData) => {
        setIsSubmitting(true);
        try {
            await addImage(clientId, {
                imageUrl: data.imageUrl,
                description: data.description || null,
            });
            gooeyToast.success('Image added to gallery!');
            reset();
            setPreviewUrl('');
            onOpenChange(false);
        } catch (error: any) {
            console.error('Gallery save error:', error);
            gooeyToast.error(error?.response?.data?.error || 'Failed to add image');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(val) => {
            if (!val) { reset(); setPreviewUrl(''); }
            onOpenChange(val);
        }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
                        <Dialog.Title className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <ImagePlus size={22} className="text-gold-500" />
                            Add Reference Image
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-slate-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-slate-800">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                        
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl" className="text-slate-300">Image URL *</Label>
                            <Input
                                id="imageUrl"
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                {...register('imageUrl')}
                                className={errors.imageUrl ? "border-red-500" : ""}
                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => setPreviewUrl(e.target.value)}
                            />
                            {errors.imageUrl && <p className="text-red-400 text-xs">{errors.imageUrl.message}</p>}
                        </div>

                        {/* Live Preview */}
                        {(previewUrl || watchedUrl) && (
                            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                                <img
                                    src={previewUrl || watchedUrl}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'block';
                                    }}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
                            <Input
                                id="description"
                                placeholder="e.g. Sleeve sketch, back piece reference..."
                                {...register('description')}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/80">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => onOpenChange(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-white border-none"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-semibold border-none min-w-[120px] flex justify-center"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Add Image'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
