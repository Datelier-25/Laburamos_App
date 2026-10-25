import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { CITIES, JOB_CATEGORIES, JOB_TYPES, SERVICE_CATEGORIES, cityOrDefault, cleanPhone, friendlyError, isValidPhone } from '../lib/utils';
import JobSign, { Ficha } from './Sign';

export default function PublishModal({ type, user, city, onClose, onCreated }) {
  const isJob = type === 'job';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    name: user.name || '',
    category: isJob ? JOB_CATEGORIES[0] : SERVICE_CATEGORIES[0],
    job_type: JOB_TYPES[0],
    salary: '',
    description: '',
    requirements: '',
    phone: user.phone || '',
    city: cityOrDefault(city),
    is_urgent: false,
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Cerrar con Escape y bloquear el scroll de fondo
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidPhone(form.phone)) {
      setError('Ingresá un WhatsApp válido: código de área y número, sin 0 ni 15. Ejemplo: 2342112233');
      return;
    }
    setLoading(true);
    const phone = cleanPhone(form.phone);

    const { error: err } = isJob
      ? await supabase.from('jobs').insert({
          company_id: user.id,
          title: form.title.trim(),
          company_name: form.name.trim(),
          category: form.category,
          job_type: form.job_type,
          salary: form.salary.trim() || null,
          location: form.city,
          phone,
          description: form.description.trim(),
          requirements: form.requirements.trim() || null,
          is_urgent: form.is_urgent,
        })
      : await supabase.from('services').insert({
          owner_id: user.id,
          provider_name: form.name.trim(),
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          phone,
          city: form.city,
        });

    if (err) {
      setError(friendlyError(err.message));
      setLoading(false);
    } else {
      onCreated(type);
    }
  };

  const previewJob = {
    category: form.category,
    title: form.title || 'Título de tu aviso',
    company_name: form.name || 'Tu comercio',
    location: form.city,
    job_type: form.job_type,
    salary: form.salary,
    is_urgent: form.is_urgent,
  };
  const previewService = {
    category: form.category,
    title: form.title || 'Tu oficio o servicio',
    provider_name: form.name || 'Tu nombre',
    city: form.city,
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={isJob ? 'Publicar un aviso' : 'Anunciar un servicio'}>
        <button type="button" className="x" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className="sheet-preview">
          <p className="cap">Así se va a ver tu {isJob ? 'cartel' : 'ficha'}</p>
          {isJob ? <JobSign job={previewJob} preview /> : <Ficha service={previewService} preview />}
        </div>

        <form className="sheet-form" onSubmit={handleSubmit}>
          <h2>{isJob ? 'Publicá tu aviso' : 'Anunciá tu servicio'}</h2>
          {error && <p className="note err">{error}</p>}

          <label className="field">
            <span>{isJob ? 'Puesto que buscás' : 'Oficio o servicio'}</span>
            <input
              required
              minLength={3}
              maxLength={120}
              placeholder={isJob ? 'Vendedor/a de atención al público' : 'Plomería y gas matriculado'}
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
            />
          </label>
          <label className="field">
            <span>{isJob ? 'Comercio o empresa' : 'Tu nombre o el de tu negocio'}</span>
            <input required value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <div className="two">
            <label className="field">
              <span>Rubro</span>
              <select value={form.category} onChange={(e) => set({ category: e.target.value })}>
                {(isJob ? JOB_CATEGORIES : SERVICE_CATEGORIES).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Localidad</span>
              <select value={form.city} onChange={(e) => set({ city: e.target.value })}>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          {isJob && (
            <div className="two">
              <label className="field">
                <span>Modalidad</span>
                <select value={form.job_type} onChange={(e) => set({ job_type: e.target.value })}>
                  {JOB_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Sueldo (opcional)</span>
                <input placeholder="$450.000" value={form.salary} onChange={(e) => set({ salary: e.target.value })} />
              </label>
            </div>
          )}
          <label className="field">
            <span>Descripción</span>
            <textarea
              required
              maxLength={2000}
              placeholder={isJob ? 'Tareas, horarios y qué ofrecés' : 'Qué trabajos hacés y en qué zonas'}
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </label>
          {isJob && (
            <label className="field">
              <span>Requisitos (opcional)</span>
              <input placeholder="Experiencia previa, edad mínima, etc." value={form.requirements} onChange={(e) => set({ requirements: e.target.value })} />
            </label>
          )}
          <label className="field">
            <span>WhatsApp para que te escriban</span>
            <input required inputMode="tel" placeholder="2342112233" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
            <small>Código de área y número, sin 0 ni 15.</small>
          </label>
          {isJob && (
            <label className="check">
              <input type="checkbox" checked={form.is_urgent} onChange={(e) => set({ is_urgent: e.target.checked })} />
              Es urgente
            </label>
          )}

          <p className="sheet-note">Queda publicado {isJob ? '30' : '90'} días. Después podés renovarlo o pausarlo desde Mis avisos.</p>
          <button className="btn btn-ink btn-lg btn-block" disabled={loading}>
            {loading ? 'Publicando…' : 'Publicar'}
          </button>
        </form>
      </div>
    </div>
  );
}
