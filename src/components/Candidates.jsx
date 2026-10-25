import { useCallback, useEffect, useMemo, useState } from 'react';
import { Phone, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ALL_CITIES, cityLabel, friendlyError, plural, timeAgo, toneFromName, waLink } from '../lib/utils';
import { CityPick, Empty, Row, SkeletonGrid } from './ui';

export default function Candidates({ city, setCity }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    let q = supabase.from('resumes').select('*').eq('is_visible', true).order('updated_at', { ascending: false });
    if (city !== ALL_CITIES) q = q.eq('city', city);
    const { data, error: err } = await q;
    if (err) setError(friendlyError(err.message));
    else setResumes(data || []);
    setLoading(false);
  }, [city]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return resumes;
    return resumes.filter((r) => [r.profession, r.skills, r.experience, r.full_name].some((v) => (v || '').toLowerCase().includes(term)));
  }, [resumes, search]);

  return (
    <section className="wrap page">
      <header className="page-head">
        <div>
          <h1 className="page-title">
            Candidatos en <CityPick dark city={city} setCity={setCity} />
          </h1>
          <p className="lede">Vecinos que activaron la opción de que las empresas los encuentren.</p>
        </div>
      </header>

      <div className="finder">
        <label className="search">
          <span className="sr">Buscar candidatos</span>
          <input type="search" placeholder="Buscá por oficio, habilidad o nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={26} aria-hidden="true" />
        </label>
      </div>

      {loading ? (
        <SkeletonGrid n={3} />
      ) : error ? (
        <Empty title="No pudimos cargar los CVs" text={error}>
          <button className="btn btn-ink" onClick={load}>
            Reintentar
          </button>
        </Empty>
      ) : filtered.length === 0 ? (
        <Empty title={`Todavía no hay CVs visibles en ${cityLabel(city)}`} text="Cuando alguien active la visibilidad de su CV, va a aparecer acá." />
      ) : (
        <>
          <p className="count">{plural(filtered.length, 'candidato', 'candidatos')}</p>
          <div className="guide">
            {filtered.map((r) => (
              <Row
                key={r.id}
                tone={toneFromName(r.full_name)}
                name={r.full_name}
                tag={r.availability || 'Disponibilidad a convenir'}
                title={r.full_name}
                by={`${r.profession} en ${r.city}, actualizó ${timeAgo(r.updated_at)}`}
                desc={[r.experience, r.skills && `Habilidades: ${r.skills}`].filter(Boolean).join(' ')}
                action={
                  <a
                    className="btn btn-ink"
                    href={waLink(r.phone, `Hola ${r.full_name}, vi tu CV en Laburamos y quisiera conversar sobre una oportunidad laboral.`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Phone size={18} /> Escribir
                  </a>
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
