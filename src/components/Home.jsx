import { useEffect, useState } from 'react';
import { ArrowRight, Briefcase, FileText, Plus, Users, Wrench } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ALL_CITIES, cityLabel, plural } from '../lib/utils';
import JobSign, { Ficha } from './Sign';
import { CityPick, Empty } from './ui';

// Pila de carteles que rota sola; al tocar el de arriba pasa el siguiente
function SignStack({ items, onMore }) {
  const [offset, setOffset] = useState(0);
  const [hold, setHold] = useState(false);
  const n = items.length;

  useEffect(() => {
    if (hold || n < 2) return undefined;
    const t = setInterval(() => setOffset((o) => (o + 1) % n), 4200);
    return () => clearInterval(t);
  }, [hold, n]);

  return (
    <div>
      <div className="stack" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
        {items.map((job, i) => {
          const pos = (i - offset + n) % n;
          return (
            <div
              key={job.id}
              className="stack-item"
              data-pos={Math.min(pos, 3)}
              onClick={() => n > 1 && pos === 0 && setOffset((o) => (o + 1) % n)}
            >
              <JobSign job={job} compact />
            </div>
          );
        })}
      </div>
      <p className="stack-hint">
        <button className="textbtn" style={{ color: 'inherit' }} onClick={onMore}>
          Ver todos los laburos
        </button>
      </p>
    </div>
  );
}

export default function Home({ user, city, setCity, go, onPublish, onLogin, saved, onSave }) {
  const [data, setData] = useState({ jobs: [], services: [], jobsN: 0, servN: 0, loading: true, error: false });

  useEffect(() => {
    let off = false;
    (async () => {
      const now = new Date().toISOString();
      let jq = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .gt('expires_at', now)
        .order('is_urgent', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);
      let sq = supabase
        .from('services')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(8);
      if (city !== ALL_CITIES) {
        jq = jq.eq('location', city);
        sq = sq.eq('city', city);
      }
      const [j, s] = await Promise.all([jq, sq]);
      if (!off) {
        setData({
          jobs: j.data || [],
          services: s.data || [],
          jobsN: j.count ?? 0,
          servN: s.count ?? 0,
          loading: false,
          error: !!(j.error || s.error),
        });
      }
    })();
    return () => {
      off = true;
    };
  }, [city]);

  const { jobs, services, jobsN, servN, loading, error } = data;
  const place = cityLabel(city);

  // Si todavía no hay avisos, la pila muestra invitaciones
  const invites = [
    { id: 'i1', category: 'Comercio', title: 'Acá va tu aviso', company_name: 'Tu comercio', location: place, job_type: 'Full-time', salary: 'Gratis' },
    { id: 'i2', category: 'Gastronomía', title: 'Se busca gente de confianza', company_name: 'Tu negocio', location: place, job_type: 'Part-time', salary: 'Gratis' },
    { id: 'i3', category: 'Oficios / Técnico', title: 'Publicá en un minuto', company_name: 'Vos', location: place, job_type: 'Changa', salary: 'Gratis' },
  ];
  const stackItems = jobs.length ? jobs.slice(0, 5) : invites;

  // Tres caminos según quién entra
  let paths;
  if (!user) {
    paths = [
      { cls: 'p1', label: 'Busco laburo', icon: Briefcase, onClick: () => go('laburos') },
      { cls: 'p2', label: 'Ofrezco un oficio', icon: Wrench, onClick: () => onPublish('service') },
      { cls: 'p3', label: 'Necesito personal', icon: Users, onClick: () => onPublish('job') },
    ];
  } else if (user.role === 'company') {
    paths = [
      { cls: 'p1', label: 'Publicar un aviso', icon: Plus, onClick: () => onPublish('job') },
      { cls: 'p2', label: 'Ver candidatos', icon: Users, onClick: () => go('candidatos') },
      { cls: 'p3', label: 'Anunciar un servicio', icon: Wrench, onClick: () => onPublish('service') },
    ];
  } else {
    paths = [
      { cls: 'p1', label: 'Busco laburo', icon: Briefcase, onClick: () => go('laburos') },
      { cls: 'p2', label: 'Armar mi CV', icon: FileText, onClick: () => go('cv') },
      { cls: 'p3', label: 'Ofrezco un oficio', icon: Wrench, onClick: () => onPublish('service') },
    ];
  }

  const tickerItems = jobs.length
    ? jobs.map((j) => `Se busca: ${j.title} en ${j.company_name}`)
    : ['Publicá tu aviso gratis', 'Contacto directo por WhatsApp', 'Sin comisiones', 'Tu cartel, en la vidriera de todo Bragado'];

  return (
    <>
      <section className="hero">
        <div className="wrap hero-in">
          <div>
            <h1>
              <span className="line"><span style={{ '--i': 0 }}>Laburo, oficios</span></span>
              <span className="line"><span style={{ '--i': 1 }}>y changas en</span></span>
              <span className="line"><span style={{ '--i': 2 }}><CityPick city={city} setCity={setCity} /></span></span>
            </h1>
            <p className="hero-sub">Avisos de comercios y vecinos de la zona. Escribís por WhatsApp y arreglás directo, sin comisiones.</p>
            <div className="paths">
              {paths.map((p) => (
                <button key={p.label} className={`path ${p.cls}`} onClick={p.onClick}>
                  <p.icon size={20} /> {p.label}
                </button>
              ))}
            </div>
            <p className="live" aria-live="polite">
              <span className="dot" aria-hidden="true" />
              {loading
                ? 'Buscando avisos…'
                : jobsN + servN > 0
                  ? `Hoy hay ${plural(jobsN, 'laburo', 'laburos')} y ${plural(servN, 'oficio', 'oficios')} publicados en ${place}.`
                  : `Todavía no hay avisos en ${place}. Publicá el primero.`}
            </p>
          </div>
          <SignStack items={stackItems} onMore={() => go('laburos')} />
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
            <span className="tk" key={i}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <section className="sec wrap">
        <div className="sec-head">
          <h2 className="sec-title">Lo último en {place}</h2>
          <button className="link-line" onClick={() => go('laburos')}>
            Ver todos los laburos
          </button>
        </div>
        {error && <p className="note err">No pudimos cargar los avisos. Revisá tu conexión y volvé a intentar.</p>}
        {loading ? (
          <div className="signs">
            {[0, 1, 2].map((k) => (
              <div key={k} className="skel" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Empty title={`Todavía no hay laburos en ${place}`} text="Si tenés un comercio, tu aviso puede ser el primero de la vidriera.">
            <button className="btn btn-ink" onClick={() => onPublish('job')}>
              Publicar un aviso
            </button>
          </Empty>
        ) : (
          <div className="signs">
            {jobs.map((job, i) => (
              <JobSign
                key={job.id}
                job={job}
                user={user}
                saved={saved.includes(job.id)}
                onSave={onSave}
                onLogin={onLogin}
                wide={i === 0 && jobs.length >= 3}
              />
            ))}
          </div>
        )}
      </section>

      <section className="sec wrap">
        <div className="sec-head">
          <h2 className="sec-title">Oficios y servicios</h2>
          <button className="link-line" onClick={() => go('oficios')}>
            Ver toda la guía
          </button>
        </div>
        {loading ? null : services.length === 0 ? (
          <Empty title="Todavía no hay oficios cargados" text="¿Hacés plomería, clases, limpieza o cuidados? Anunciate y que te encuentren.">
            <button className="btn btn-ink" onClick={() => onPublish('service')}>
              Anunciar mi servicio
            </button>
          </Empty>
        ) : (
          <div className="rail">
            {services.map((s) => (
              <Ficha key={s.id} service={s} user={user} onLogin={onLogin} />
            ))}
          </div>
        )}
      </section>

      <section className="sec wrap">
        <div className="sec-head">
          <h2 className="sec-title">Cómo funciona</h2>
        </div>
        <div className="steps">
          <div className="step">
            <b>1</b>
            <h3>Mirá los avisos</h3>
            <p>Elegí tu localidad y el rubro. Sin cuenta ya podés ver todo lo que hay.</p>
          </div>
          <div className="step">
            <b>2</b>
            <h3>Tocá el botón</h3>
            <p>Se abre WhatsApp con un mensaje listo para mandar. Si querés, lo cambiás.</p>
          </div>
          <div className="step">
            <b>3</b>
            <h3>Arreglá directo</h3>
            <p>Hablás con el comercio o el profesional. No cobramos comisión.</p>
          </div>
        </div>
      </section>

      <section className="sec wrap">
        <div className="cta">
          <div>
            <h2>Tu aviso en la vidriera de todo Bragado.</h2>
            <p>Publicá una búsqueda en un minuto. Dura 30 días, es gratis y los candidatos te escriben directo a tu WhatsApp.</p>
            <button className="btn btn-ink btn-lg" onClick={() => onPublish('job')}>
              <ArrowRight size={20} /> Publicar un aviso
            </button>
          </div>
          <JobSign
            preview
            job={{ category: 'Comercio', title: 'Se busca vendedor/a', company_name: 'Tu comercio', location: cityLabel(city), job_type: 'Part-time', salary: '$450.000' }}
          />
        </div>
      </section>
    </>
  );
}
