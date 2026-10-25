import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ALL_CITIES, JOB_CATEGORIES, JOB_TYPES, cityLabel, friendlyError, plural } from '../lib/utils';
import JobSign from './Sign';
import { CityPick, Empty, SkeletonGrid } from './ui';

export default function JobList({ user, city, setCity, onPublish, onLogin, saved, onSave }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [jobType, setJobType] = useState('Todas');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    let q = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: false });
    if (city !== ALL_CITIES) q = q.eq('location', city);
    const { data, error: err } = await q;
    if (err) setError(friendlyError(err.message));
    else setJobs(data || []);
    setLoading(false);
  }, [city]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobs.filter((j) => {
      const text = !term || [j.title, j.company_name, j.description].some((v) => (v || '').toLowerCase().includes(term));
      return (
        text &&
        (category === 'Todos' || j.category === category) &&
        (jobType === 'Todas' || j.job_type === jobType) &&
        (!onlyUrgent || j.is_urgent) &&
        (!onlySaved || saved.includes(j.id))
      );
    });
  }, [jobs, search, category, jobType, onlyUrgent, onlySaved, saved]);

  const clear = () => {
    setSearch('');
    setCategory('Todos');
    setJobType('Todas');
    setOnlyUrgent(false);
    setOnlySaved(false);
  };

  return (
    <section className="wrap page">
      <header className="page-head">
        <div>
          <h1 className="page-title">
            Laburos en <CityPick dark city={city} setCity={setCity} />
          </h1>
          <p className="lede">Escribile directo a quien publica. Sin intermediarios ni comisiones.</p>
        </div>
        {(!user || user.role === 'company') && (
          <button className="btn btn-ink" onClick={() => onPublish('job')}>
            Publicar un aviso
          </button>
        )}
      </header>

      <div className="finder">
        <label className="search">
          <span className="sr">Buscar laburos</span>
          <input type="search" placeholder="Buscá un puesto o un comercio" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={26} aria-hidden="true" />
        </label>
        <div className="chips" role="group" aria-label="Rubro">
          {['Todos', ...JOB_CATEGORIES].map((c) => (
            <button key={c} className={`chip${category === c ? ' on' : ''}`} onClick={() => setCategory(c)} aria-pressed={category === c}>
              {c}
            </button>
          ))}
        </div>
        <div className="mini-row">
          <select className="mini" value={jobType} onChange={(e) => setJobType(e.target.value)} aria-label="Modalidad">
            <option value="Todas">Cualquier modalidad</option>
            {JOB_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button className={`chip${onlyUrgent ? ' on' : ''}`} onClick={() => setOnlyUrgent(!onlyUrgent)} aria-pressed={onlyUrgent}>
            Solo urgentes
          </button>
          <button className={`chip${onlySaved ? ' on' : ''}`} onClick={() => setOnlySaved(!onlySaved)} aria-pressed={onlySaved}>
            Guardados ({saved.length})
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <Empty title="No pudimos cargar los avisos" text={error}>
          <button className="btn btn-ink" onClick={load}>
            Reintentar
          </button>
        </Empty>
      ) : filtered.length === 0 ? (
        <Empty
          title={jobs.length === 0 ? `Todavía no hay laburos en ${cityLabel(city)}` : 'Ningún aviso coincide'}
          text={jobs.length === 0 ? 'Sé el primero en publicar y quedás arriba de todo.' : 'Probá con otra palabra o sacá algún filtro.'}
        >
          {jobs.length === 0 ? (
            <button className="btn btn-ink" onClick={() => onPublish('job')}>
              Publicar un aviso
            </button>
          ) : (
            <button className="btn btn-ink" onClick={clear}>
              Limpiar filtros
            </button>
          )}
        </Empty>
      ) : (
        <>
          <p className="count" aria-live="polite">
            {plural(filtered.length, 'aviso', 'avisos')} en {cityLabel(city)}
          </p>
          <div className="signs">
            {filtered.map((job, i) => (
              <JobSign
                key={job.id}
                job={job}
                user={user}
                saved={saved.includes(job.id)}
                onSave={onSave}
                onLogin={onLogin}
                wide={i === 0 && filtered.length >= 3 && !search}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
