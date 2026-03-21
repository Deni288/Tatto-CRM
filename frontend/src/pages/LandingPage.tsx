import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, Calendar, Inbox, FileText, Image,
    ArrowRight, CheckCircle, Star, Zap, Shield, Bell,
} from 'lucide-react';

const fadeUp = (i: number) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { delay: i * 0.1, duration: 0.5 },
    viewport: { once: true as const, margin: '-60px' as const },
});

const features = [
    { icon: Users, title: 'Upravljanje klijentima', desc: 'Kompletni profili klijenata s historijom, galerijem radova i custom poljima.' },
    { icon: Calendar, title: 'Kalendar termina', desc: 'Zakazivanje s praćenjem depozita, statusima i automatskim podsjetniciima.' },
    { icon: Inbox, title: 'Booking Requests', desc: 'Javni booking link za Instagram. Klijenti šalju upite, ti ih odobravaš.' },
    { icon: FileText, title: 'Digitalni consent', desc: 'Klijent potpisuje pristanak prstom na licu mjesta. Sve u oblaku.' },
    { icon: Image, title: 'Galerija radova', desc: 'Upload fotografija direktno na Cloudinary. Brzo, bezlično, sigurno.' },
    { icon: Bell, title: 'Automatski podsjetnici', desc: 'Klijent dan ranije automatski dobiva email s detaljima termina.' },
];

const steps = [
    { num: '01', title: 'Registracija', desc: '30 dana besplatno, bez kartice. Kreiraj account za 60 sekundi.' },
    { num: '02', title: 'Postavi profil', desc: 'Kopiraj tvoj booking link na Instagram ili web stranicu.' },
    { num: '03', title: 'Upravljaj poslom', desc: 'Klijenti, termini i consent forme — sve na jednom mjestu.' },
];

const testimonials = [
    { name: 'Marko T.', role: 'Tattoo Artist · Zagreb', text: 'Napokon mogu zaboraviti Excel tablice. Sve što trebam je na jednom mjestu.' },
    { name: 'Ana K.', role: 'Tattoo Artist · Split', text: 'Klijenti su oduševljeni kad dobiju automatski email s detaljima termina.' },
    { name: 'Dino R.', role: 'Tattoo Artist · Sarajevo', text: 'Booking link na Instagramu mi je duplirao broj upita u prvom tjednu.' },
];

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <span className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-gold-500 to-yellow-500 tracking-wider">
                        Tattoo <span className="text-white">CRM</span>
                    </span>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
                            Prijava
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-semibold px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-slate-900 transition-colors"
                        >
                            Počni besplatno
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gold-500/5 rounded-full blur-3xl" />
                    <div className="absolute top-40 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-2xl" />
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-medium mb-8"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        CRM dizajniran isključivo za tattoo artiste
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black leading-tight mb-6"
                    >
                        Tvoj posao.{' '}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-gold-400 to-yellow-500">
                            Tvoja pravila.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Upravljaj klijentima, terminima i booking requestima na jednom mjestu.
                        Manje administracije, više tattooiranja.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold text-lg transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
                        >
                            Počni besplatno — 30 dana
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-lg transition-colors border border-slate-700"
                        >
                            Imam account
                        </Link>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 text-slate-500 text-sm"
                    >
                        Bez kartice. Bez obaveza. Otkaži kad hoćeš.
                    </motion.p>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6 bg-slate-900/50">
                <div className="max-w-6xl mx-auto">
                    <motion.div {...fadeUp(0)} className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">Sve što trebaš, ništa što ne trebaš</h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">
                            Svaki feature je osmišljen za tattoo artiste — ne za generičke biznise.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                {...fadeUp(i)}
                                className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-gold-500/30 transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.05)]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4 group-hover:bg-gold-500/20 transition-colors">
                                    <f.icon className="w-6 h-6 text-gold-400" />
                                </div>
                                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div {...fadeUp(0)} className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">Počni za 3 koraka</h2>
                        <p className="text-slate-400 text-lg">Setup traje manje od 5 minuta.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((s, i) => (
                            <motion.div key={s.num} {...fadeUp(i)} className="text-center">
                                <div className="text-6xl font-black text-gold-500/20 mb-4">{s.num}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 bg-slate-900/50">
                <div className="max-w-6xl mx-auto">
                    <motion.div {...fadeUp(0)} className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">Artisti koji koriste Tattoo CRM</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={t.name}
                                {...fadeUp(i)}
                                className="p-6 rounded-2xl bg-slate-900 border border-slate-800"
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-gold-500 text-gold-500" />
                                    ))}
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                                <div>
                                    <p className="font-semibold text-white text-sm">{t.name}</p>
                                    <p className="text-slate-500 text-xs">{t.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div {...fadeUp(0)} className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">Jednostavne cijene</h2>
                        <p className="text-slate-400 text-lg">30 dana besplatno. Bez kartice.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {[
                            {
                                label: 'Mjesečno', price: '€22', sub: '/mjesec', badge: undefined,
                                features: ['Neograničeni klijenti', 'Automatski podsjetnici', 'Digitalni consent', 'Booking link', 'Galerija radova', 'CSV export'],
                            },
                            {
                                label: 'Godišnje', price: '€18', sub: '/mjesec · €220/god', badge: 'Uštedi 2 mj.',
                                features: ['Sve iz Miesečnog', '2 besplatna mjeseca', 'Prioritetna podrška'],
                            },
                        ].map((plan, i) => (
                            <motion.div
                                key={plan.label}
                                {...fadeUp(i)}
                                className={`p-8 rounded-2xl border ${i === 1 ? 'bg-gold-500/5 border-gold-500/30 shadow-[0_0_40px_rgba(212,175,55,0.08)]' : 'bg-slate-900 border-slate-800'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400 font-medium">{plan.label}</span>
                                    {plan.badge && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-gold-500/20 text-gold-400 font-semibold">{plan.badge}</span>
                                    )}
                                </div>
                                <div className="mb-6">
                                    <span className="text-5xl font-black text-white">{plan.price}</span>
                                    <span className="text-slate-400 text-sm ml-2">{plan.sub}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                                            <CheckCircle className="w-4 h-4 text-gold-500 shrink-0" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/register"
                                    className={`block text-center py-3 rounded-xl font-semibold transition-all ${i === 1 ? 'bg-gold-500 hover:bg-gold-400 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}
                                >
                                    Počni besplatno
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/5 rounded-full blur-3xl" />
                </div>
                <motion.div {...fadeUp(0)} className="relative max-w-2xl mx-auto text-center">
                    <Shield className="w-12 h-12 text-gold-500/50 mx-auto mb-6" />
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Spreman za promjenu?</h2>
                    <p className="text-slate-400 text-lg mb-10">
                        Pridruži se tattoo artistima koji su zamijenili WhatsApp i Excel s pravim alatom.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold text-xl transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]"
                    >
                        Počni besplatno — 30 dana
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                    <p className="mt-4 text-slate-500 text-sm">Bez kartice · Otkaži kad hoćeš</p>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-gold-500 to-yellow-500 tracking-wider">
                        Tattoo <span className="text-white">CRM</span>
                    </span>
                    <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tattoo CRM. Sva prava pridržana.</p>
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                        <Link to="/login" className="hover:text-white transition-colors">Prijava</Link>
                        <Link to="/register" className="hover:text-white transition-colors">Registracija</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};
