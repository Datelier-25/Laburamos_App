import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { daysLeft, friendlyError } from '../lib/utils';
import { Empty } from './ui';

const LABEL = { active: 'Activo', paused: 'Pausado', filled: 'Cubierto', expired: 'Vencido' };

function Post({ item, kind, onPatch, onDelete }) {
  const isJob = kind === 'job';
  const expired = new Date(item.expires_at) < new Date();
  const state = item.status === 'active' && expired ? 'expired' : item.status;
  const renewDays = isJob ? 30 : 90;
  const left = daysLeft(item.expires_at);

  return (
    <article className="post">
      <div>
        <h3>{item.title}</h3>
        <p>
          {isJob ? `${item.company_name} en ${item.location}` : `${item.provider_name} en ${item.city}`}.{' '}
          {left > 0 ? `Vence en ${left} días.` : 'Está vencido: renovalo para que vuelva a verse.'}
        </p>
      </div>
      <span className={`pill ${state}`}>{LABEL[state]}</span>
      <div className="acts">
        {item.status === 'active' && !expired && (
          <button className="btn btn-line btn-sm" onClick={() => onPatch(kind, item.id, { status: 'paused' }, 'Aviso pausado')}>
            Pausar
          </button>
        )}
        {item.status !== 'active' && (
          <button className="btn btn-line btn-sm" onClick={() => onPatch(kind, item.id, { status: 'active' }, 'Aviso activo')}>
            Reactivar
          </button>
        )}
        {isJob && item.status === 'active' && (
          <button className="btn btn-line btn-sm" onClick={() => onPatch(kind, item.id, { status: 'filled' }, 'Marcado como cubierto')}>
            Ya lo cubrí
          </button>
        )}
        <button
          className="btn btn-line btn-sm"
          onClick={() =>
            onPatch(kind, item.id, { status: 'active', expires_at: new Date(Date.now() + renewDays * 86400000).toISOString() }, `Renovado por ${renewDays} días`)
          }
        >
          Renovar {renewDays} días
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(kind, item.id, item.title)}>
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default function MyPosts({ user, onPublish, notify }) {
  const isCompany = user.role === 'company';
  const [jobs, setJobs] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [j, s] = await Promise.all([
      isCompany
        ? supabase.from('jobs').select('*').eq('company_id', user.id).order('created_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      supabase.from('services').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    ]);
    const err = j.error || s.error;
    if (err) setError(friendlyError(err.message));
    setJobs(j.data || []);
    setServices(s.data || []);
    setLoading(false);
  }, [user.id, isCompany]);

  useEffect(() => {
    load();
  }, [load]);

  const table = (kind) => (kind === 'job' ? 'jobs' : 'services');

  const handlePatch = async (kind, id, patch, message) => {
    const { error: err } = await supabase.from(table(kind)).update(patch).eq('id', id);
    if (err) setError(friendlyError(err.message));
    else {
      notify(message);
      load();
    }
  };

  const handleDelete = async (kind, id, title) => {
    if (!window.confirm(`¿Eliminar "${title}"? No se puede deshacer.`)) return;
    const { error: err } = await supabase.from(table(kind)).delete().eq('id', id);
    if (err) setError(friendlyError(err.message));
    else {
      notify('Aviso eliminado');
      load();
    }
  };

  return (
    <section className="wrap page">
      <header className="page-head">
        <div>
          <h1 className="page-title">Mis avisos</h1>
          <p className="lede">Pausá, renová o eliminá lo que publicaste cuando quieras.</p>
        </div>
        <button className="btn btn-ink" onClick={() => onPublish(isCompany ? 'job' : 'service')}>
          {isCompany ? 'Publicar un aviso' : 'Anunciar un servicio'}
        </button>
      </header>

      {error && <p className="note err">{error}</p>}
      {loading && <p className="count">Cargando…</p>}

      {!loading && isCompany && (
        <>
          <h2 className="block-title">Ofertas laborales</h2>
          {jobs.length === 0 ? (
            <Empty title="Todavía no publicaste ningún laburo" text="Tu primer aviso tarda un minuto y dura 30 días.">
              <button className="btn btn-ink" onClick={() => onPublish('job')}>
                Publicar un aviso
              </button>
            </Empty>
          ) : (
            <div className="mine">
              {jobs.map((j) => (
                <Post key={j.id} item={j} kind="job" onPatch={handlePatch} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && (
        <>
          <h2 className="block-title">Servicios</h2>
          {services.length === 0 ? (
            <Empty title="Todavía no anunciaste ningún servicio" text="Si hacés un oficio, anunciate y que te encuentren.">
              <button className="btn btn-ink" onClick={() => onPublish('service')}>
                Anunciar un servicio
              </button>
            </Empty>
          ) : (
            <div className="mine">
              {services.map((s) => (
                <Post key={s.id} item={s} kind="service" onPatch={handlePatch} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
