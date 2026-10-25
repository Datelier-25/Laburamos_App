import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { AVAILABILITY, CITIES, cityOrDefault, cleanPhone, friendlyError, isValidPhone } from '../lib/utils';

export default function MyResume({ user, city, notify }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('edit');
  const [form, setForm] = useState({
    full_name: user.name || '',
    profession: '',
    experience: '',
    skills: '',
    availability: AVAILABILITY[0],
    phone: user.phone || '',
    city: cityOrDefault(city),
    is_visible: false,
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    let off = false;
    (async () => {
      const { data } = await supabase.from('resumes').select('*').eq('user_id', user.id).maybeSingle();
      if (off) return;
      if (data) {
        setForm({
          full_name: data.full_name || '',
          profession: data.profession || '',
          experience: data.experience || '',
          skills: data.skills || '',
          availability: data.availability || AVAILABILITY[0],
          phone: data.phone || '',
          city: data.city || 'Bragado',
          is_visible: !!data.is_visible,
        });
      }
      setLoading(false);
    })();
    return () => {
      off = true;
    };
  }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidPhone(form.phone)) {
      setError('Ingresá un WhatsApp válido: código de área y número, sin 0 ni 15. Ejemplo: 2342112233');
      return;
    }
    setSaving(true);
    const { error: err } = await supabase.from('resumes').upsert(
      {
        user_id: user.id,
        full_name: form.full_name.trim(),
        profession: form.profession.trim(),
        experience: form.experience.trim(),
        skills: form.skills.trim(),
        availability: form.availability,
        phone: cleanPhone(form.phone),
        city: form.city,
        is_visible: form.is_visible,
      },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    if (err) setError(friendlyError(err.message));
    else notify('CV guardado');
  };

  const filled = [form.full_name, form.profession, form.experience, form.skills, isValidPhone(form.phone) ? 'ok' : ''].filter(Boolean).length;
  const pct = Math.round((filled / 5) * 100);
  const canShare = form.profession && isValidPhone(form.phone);
  const shareText =
    `CV de ${form.full_name}, ${form.profession}\n` +
    (form.experience ? `Experiencia: ${form.experience}\n` : '') +
    (form.skills ? `Habilidades: ${form.skills}\n` : '') +
    `Disponibilidad: ${form.availability}\n` +
    `Contacto: https://wa.me/549${cleanPhone(form.phone)}`;

  if (loading) return <p className="wrap page-head">Cargando tu CV…</p>;

  return (
    <section className="wrap page">
      <header className="page-head">
        <div>
          <h1 className="page-title">Mi CV</h1>
          <p className="lede">Armalo una vez y mandalo por WhatsApp cuando te pidan un currículum.</p>
        </div>
      </header>

      <div className="seg" role="group" aria-label="Vista">
        <button className={view === 'edit' ? 'on' : ''} onClick={() => setView('edit')}>
          Editar
        </button>
        <button className={view === 'view' ? 'on' : ''} onClick={() => setView('view')}>
          Ver cómo queda
        </button>
      </div>

      <div className="cv-grid" data-view={view}>
        <form className="cv-form" onSubmit={handleSubmit}>
          {error && <p className="note err">{error}</p>}

          <label className="field">
            <span>Nombre y apellido</span>
            <input required value={form.full_name} onChange={(e) => set({ full_name: e.target.value })} />
          </label>
          <label className="field">
            <span>Oficio o profesión principal</span>
            <input required placeholder="Vendedora, albañil, administrativo" value={form.profession} onChange={(e) => set({ profession: e.target.value })} />
          </label>
          <label className="field">
            <span>Experiencia</span>
            <textarea placeholder="Dónde trabajaste y qué tareas hacías" value={form.experience} onChange={(e) => set({ experience: e.target.value })} />
          </label>
          <label className="field">
            <span>Habilidades</span>
            <input placeholder="Atención al público, caja, Excel básico" value={form.skills} onChange={(e) => set({ skills: e.target.value })} />
          </label>
          <div className="two">
            <label className="field">
              <span>Disponibilidad</span>
              <select value={form.availability} onChange={(e) => set({ availability: e.target.value })}>
                {AVAILABILITY.map((a) => (
                  <option key={a}>{a}</option>
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
          <label className="field">
            <span>Tu WhatsApp</span>
            <input required inputMode="tel" placeholder="2342112233" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
            <small>Código de área y número, sin 0 ni 15.</small>
          </label>

          <label className="switch">
            <input className="sr" type="checkbox" checked={form.is_visible} onChange={(e) => set({ is_visible: e.target.checked })} />
            <span className="sw" aria-hidden="true" />
            <span>
              <b>Que las empresas me encuentren</b>
              <small>{form.is_visible ? 'Los comercios registrados pueden ver tu CV y escribirte.' : 'Ahora solo lo ves vos.'}</small>
            </span>
          </label>

          <div className="meter-wrap">
            <div className="meter" style={{ '--p': `${pct}%` }}>
              <i />
            </div>
            Tu CV está al {pct}%
          </div>

          <button className="btn btn-ink btn-lg btn-block" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar mi CV'}
          </button>
        </form>

        <aside className="cv-preview" aria-label="Vista previa del CV">
          <div className="credential">
            <div className={`stamp${form.is_visible ? ' on' : ''}`}>Visible para empresas</div>
            <p className="cred-city">{form.city}</p>
            <h2>{form.full_name || 'Tu nombre'}</h2>
            <p className="cred-role">{form.profession || 'Tu oficio o profesión'}</p>
            <dl>
              <div>
                <dt>Experiencia</dt>
                <dd>{form.experience || 'Contá dónde trabajaste y qué hacías.'}</dd>
              </div>
              <div>
                <dt>Habilidades</dt>
                <dd>{form.skills || 'Tus habilidades van acá.'}</dd>
              </div>
              <div>
                <dt>Disponibilidad</dt>
                <dd>{form.availability}</dd>
              </div>
            </dl>
            <a
              className={`btn btn-sun btn-block${canShare ? '' : ' disabled'}`}
              style={canShare ? undefined : { opacity: 0.5, pointerEvents: 'none' }}
              href={canShare ? `https://wa.me/?text=${encodeURIComponent(shareText)}` : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!canShare}
            >
              <Share2 size={18} /> Compartir por WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
