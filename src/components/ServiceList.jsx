import { useCallback, useEffect, useMemo, useState } from 'react';
import { Phone, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ALL_CITIES, SERVICE_CATEGORIES, cityLabel, friendlyError, plural, toneOf, waLink } from '../lib/utils';
import { CityPick, Empty, Row, SkeletonGrid } from './ui';

export default function ServiceList({ user, city, setCity, onPublish, onLogin }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    let q = supabase
      .from('services')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (city !== ALL_CITIES) q = q.eq('city', city);
    const { data, error: err } = await q;
    if (err) setError(friendlyError(err.message));
    else setServices(data || []);
    setLoading(false);
  }, [city]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter((s) => {
      const text = !term || [s.title, s.provider_name, s.description].some((v) => (v || '').toLowerCase().includes(term));
      return text && (category === 'Todos' || s.category === category);
    });
  }, [services, search, category]);

  return (
    <section className="wrap page">
      <header className="page-head">
        <div>
          <h1 className="page-title">
            Oficios en <CityPick dark city={city} setCity={setCity} />
          </h1>
          <p className="lede">Plomeros, electricistas, profes, cuidados y más. Contactalos directo.</p>
        </div>
        <button className="btn btn-ink" onClick={() => onPublish('service')}>
          Anunciar mi servicio
        </button>
      </header>

      <div className="finder">
        <label className="search">
          <span className="sr">Buscar oficios</span>
          <input type="search" placeholder="Buscá un oficio o un nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={26} aria-hidden="true" />
        </label>
        <div className="chips" role="group" aria-label="Rubro">
          {['Todos', ...SERVICE_CATEGORIES].map((c) => (
            <button key={c} className={`chip${category === c ? ' on' : ''}`} onClick={() => setCategory(c)} aria-pressed={category === c}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonGrid n={3} />
      ) : error ? (
        <Empty title="No pudimos cargar la guía" text={error}>
          <button className="btn btn-ink" onClick={load}>
            Reintentar
          </button>
        </Empty>
      ) : filtered.length === 0 ? (
        <Empty
          title={services.length === 0 ? `Todavía no hay oficios en ${cityLabel(city)}` : 'No encontramos ese oficio'}
          text={services.length === 0 ? '¿Hacés algún trabajo? Anunciate y que te encuentren.' : 'Probá con otra palabra o con otro rubro.'}
        >
          <button className="btn btn-ink" onClick={() => onPublish('service')}>
            Anunciar mi servicio
          </button>
        </Empty>
      ) : (
        <>
          <p className="count" aria-live="polite">
            {plural(filtered.length, 'servicio', 'servicios')} en {cityLabel(city)}
          </p>
          <div className="guide">
            {filtered.map((s) => (
              <Row
                key={s.id}
                tone={toneOf(s.category)}
                name={s.provider_name}
                tag={s.category}
                title={s.title}
                by={`${s.provider_name} en ${s.city}`}
                desc={s.description}
                action={
                  user ? (
                    <a
                      className="btn btn-ink"
                      href={waLink(s.phone, `Hola, vi tu servicio de "${s.title}" en Laburamos y quería consultarte.`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Phone size={18} /> Escribir
                    </a>
                  ) : (
                    <button className="btn btn-ink" onClick={onLogin}>
                      Ingresá para escribir
                    </button>
                  )
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
