import React, { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  FileImage,
  History,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { supabase, STORAGE_BUCKET } from './supabase'

const BASE = import.meta.env.BASE_URL

const LOCAL_ASSETS = [
  {
    id: 'seed-logo',
    name: 'Logo oficial Immagine',
    type: 'logo',
    public_url: `${BASE}assets/immagine-logo.png`,
    created_at: '2026-09-22T12:00:00Z'
  },
  {
    id: 'seed-promocao',
    name: 'Arte — Promoção geral',
    type: 'arte_aprovada',
    public_url: `${BASE}assets/arte-promocao.png`,
    created_at: '2026-09-22T12:00:00Z'
  },
  {
    id: 'seed-papelaria',
    name: 'Arte — Papelaria personalizada',
    type: 'arte_aprovada',
    public_url: `${BASE}assets/arte-papelaria.png`,
    created_at: '2026-09-22T12:00:00Z'
  },
  {
    id: 'seed-banners',
    name: 'Arte — Banners para sua marca',
    type: 'arte_aprovada',
    public_url: `${BASE}assets/arte-banners.png`,
    created_at: '2026-09-22T12:00:00Z'
  },
  {
    id: 'week-2026-09-28-fachadas',
    name: 'Semana 28/09 — Fachadas que comunicam',
    type: 'arte_aprovada',
    public_url: `${BASE}assets/semana-2026-09-28/fachadas.webp`,
    created_at: '2026-09-25T12:00:00Z'
  },
  {
    id: 'week-2026-09-29-grande-formato',
    name: 'Semana 29/09 — Grande formato',
    type: 'arte_aprovada',
    public_url: `${BASE}assets/semana-2026-09-28/grande-formato.webp`,
    created_at: '2026-09-25T12:00:00Z'
  },
  {
    id: 'week-2026-09-30-adesivos',
    name: 'Semana 30/09 — Adesivos que transformam',
    type: 'arte_aprovada',
    public_url: `${BASE}assets/semana-2026-09-28/adesivos.webp`,
    created_at: '2026-09-25T12:00:00Z'
  },
  {
    id: 'week-2026-10-01-papelaria',
    name: 'Semana 01/10 — Papelaria personalizada',
    type: 'arte_aprovada',
    public_url: `${BASE}assets/arte-papelaria.png`,
    created_at: '2026-09-25T12:00:00Z'
  },
  {
    id: 'week-2026-10-02-banners',
    name: 'Semana 02/10 — Banners e faixas',
    type: 'arte_aprovada',
    public_url: `${BASE}assets/arte-banners.png`,
    created_at: '2026-09-25T12:00:00Z'
  },
]

const STATUS = {
  em_criacao: ['Em criação', 'status-neutral'],
  para_aprovacao: ['Para aprovação', 'status-warning'],
  aprovada: ['Aprovada', 'status-success'],
  programada: ['Programada', 'status-info'],
  publicada: ['Publicada', 'status-primary'],
}

const NAV = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['calendario', 'Calendário', CalendarDays],
  ['biblioteca', 'Biblioteca', Images],
  ['historico', 'Histórico', History],
  ['configuracoes', 'Configurações', Settings],
]

function toTime(value) {
  return value ? String(value).slice(0, 5) : '15:00'
}

function resolveImage(url) {
  if (!url) return null
  if (url.startsWith('/assets/')) return `${BASE}${url.slice(1)}`
  return url
}

function canSharePost(status) {
  return ['aprovada', 'programada', 'publicada'].includes(status)
}

async function shareWhatsAppStatus(post, onToast) {
  const text = post.whatsapp_text || post.caption || ''
  const imageUrl = resolveImage(post.image_url)

  try {
    if (!navigator.share) {
      throw new Error('share-unavailable')
    }

    if (imageUrl) {
      try {
        const response = await fetch(imageUrl)

        if (response.ok) {
          const blob = await response.blob()

          const extension =
            blob.type.includes('jpeg')
              ? 'jpg'
              : blob.type.includes('webp')
                ? 'webp'
                : 'png'

          const file = new File(
            [blob],
            `immagine-${post.post_date || 'status'}.${extension}`,
            {
              type: blob.type || 'image/png'
            }
          )

          if (!navigator.canShare || navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: post.title || 'Immagine',
              text,
              files: [file]
            })
            return
          }
        }
      } catch (imageError) {
        console.warn('Não foi possível anexar a imagem:', imageError)
      }
    }

    await navigator.share({
      title: post.title || 'Immagine',
      text
    })

  } catch (err) {
    if (err?.name === 'AbortError') return

    if (onToast) {
      onToast(
        'Abrindo o WhatsApp. Se a imagem não aparecer automaticamente, use o botão Baixar arte.',
        'ok'
      )
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener'
    )
  }
}

function formatDate(iso) {
  if (!iso) return ''

  const [y, m, d] = iso
    .slice(0, 10)
    .split('-')
    .map(Number)

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(y, m - 1, d))
}

function formatDateTime(iso) {
  if (!iso) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo'
  }).format(new Date(iso))
}

function addDays(iso, amount) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + amount))
  return date.toISOString().slice(0, 10)
}

function weekLabel(startDate) {
  const end = addDays(startDate, 4)

  const [sy, sm, sd] = startDate.split('-').map(Number)
  const [, em, ed] = end.split('-').map(Number)

  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro'
  ]

  return sm === em
    ? `${sd} a ${ed} de ${months[sm - 1]} de ${sy}`
    : `${sd}/${String(sm).padStart(2, '0')} a ${ed}/${String(em).padStart(2, '0')} de ${sy}`
}

function Toast({ toast }) {
  if (!toast) return null

  return (
    <div className={`toast ${toast.type || 'ok'}`}>
      {toast.message}
    </div>
  )
}

function StatusBadge({ status }) {
  const meta = STATUS[status] || STATUS.em_criacao

  return (
    <span className={`status-badge ${meta[1]}`}>
      <span />
      {meta[0]}
    </span>
  )
}

function Login({ onToast }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()

    if (!email || password.length < 6) {
      onToast(
        'Informe seu e-mail e uma senha com pelo menos 6 caracteres.',
        'error'
      )
      return
    }

    setBusy(true)

    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (result.error) throw result.error

      onToast('Acesso liberado.')
    } catch (err) {
      onToast(
        err.message || 'Não foi possível entrar.',
        'error'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-brand">
          <img
            src={`${BASE}assets/immagine-logo.png`}
            alt="Immagine"
          />

          <div>
            <strong>Immagine Social</strong>
            <span>Painel de conteúdo e aprovação</span>
          </div>
        </div>

        <div className="auth-copy">
          <span className="eyebrow">
            <Sparkles size={15}/>
            Gestão de conteúdo
          </span>

          <h1>
            Seu calendário social, organizado do começo à publicação.
          </h1>

          <p>
            Planeje, revise e aprove o conteúdo da Immagine em um só lugar, sem depender de serviços pagos para editar o calendário.
          </p>
        </div>
      </div>

      <form
        className="auth-card"
        onSubmit={submit}
      >
        <div>
          <span className="eyebrow">
            Acesso privado
          </span>

          <h2>
            Entrar no painel
          </h2>

          <p>
            Acesso restrito à conta autorizada da Immagine.
          </p>
        </div>

        <label>
          E-mail

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seuemail@empresa.com"
          />
        </label>

        <label>
          Senha

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
          />
        </label>

        <button
          className="btn primary"
          disabled={busy}
        >
          {busy ? 'Aguarde...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

function Sidebar({
  page,
  setPage,
  mobileOpen,
  setMobileOpen
}) {
  return (
    <>
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div>
          <div className="brand-row">
            <div className="logo-box">
              <img
                src={`${BASE}assets/immagine-logo.png`}
                alt="Immagine"
              />
            </div>

            <div>
              <strong>Immagine Social</strong>
              <span>Painel de conteúdo</span>
            </div>
          </div>

          <nav>
            {NAV.map(([id, label, Icon]) => (
              <button
                key={id}
                className={page === id ? 'active' : ''}
                onClick={() => {
                  setPage(id)
                  setMobileOpen(false)
                }}
              >
                <Icon size={18}/>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-foot">
          <strong>Você imagina e a gente realiza.</strong>
          <span>@immaginecvrp · (17) 99137-6531</span>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        />
      )}
    </>
  )
}

function Header({
  setMobileOpen,
  session,
  onSignOut
}) {
  return (
    <header className="topbar">
      <button
        className="icon-btn mobile-menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20}/>
      </button>

      <div className="topbar-title">
        <strong>Immagine Social</strong>
        <span>Painel de conteúdo e aprovação</span>
      </div>

      <div className="topbar-actions">
        <span className="sync-pill">
          <span/>
          Dados online
        </span>

        <span className="user-email">
          {session?.user?.email}
        </span>

        <button
          className="icon-btn"
          onClick={onSignOut}
          title="Sair"
        >
          <LogOut size={18}/>
        </button>
      </div>
    </header>
  )
}

function PageHeading({
  title,
  description,
  actions
}) {
  return (
    <div className="page-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      {actions && (
        <div className="heading-actions">
          {actions}
        </div>
      )}
    </div>
  )
}

function Dashboard({
  weeks,
  currentWeek,
  posts,
  setPage,
  setEditingPost,
  onNewWeek
}) {
  const currentPosts = posts.filter(
    p => p.week_id === currentWeek?.id
  )

  const pending = currentPosts.filter(
    p => p.status === 'para_aprovacao'
  ).length

  const ready = currentPosts.filter(
    p => p.ready
  ).length

  const approved = currentPosts.filter(
    p => ['aprovada', 'programada', 'publicada'].includes(p.status)
  ).length

  const next =
    currentPosts.find(p => p.status === 'para_aprovacao') ||
    currentPosts.find(p => p.status === 'em_criacao')

  return (
    <>
      <PageHeading
        title="Dashboard"
        description="Visão rápida da semana e do que precisa da sua atenção."
        actions={
          <>
            <button
              className="btn ghost"
              onClick={() => setPage('calendario')}
            >
              Abrir semana
            </button>

            <button
              className="btn primary"
              onClick={onNewWeek}
            >
              <Plus size={16}/>
              Nova semana
            </button>
          </>
        }
      />

      <div className="stats-grid">
        <Stat
          label="Posts prontos"
          value={ready}
          helper="na semana atual"
        />

        <Stat
          label="Pendentes"
          value={pending}
          helper="aguardando aprovação"
        />

        <Stat
          label="Aprovados"
          value={approved}
          helper="na semana selecionada"
        />

        <Stat
          label="Status da semana"
          value={<StatusBadge status={currentWeek?.status}/>}
          helper={currentWeek?.label || ''}
          compact
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel week-hero">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                Semana atual
              </span>

              <h3>{currentWeek?.label}</h3>
            </div>

            <StatusBadge status={currentWeek?.status}/>
          </div>

          <div className="week-focus-banner">
            <div>
              <span className="eyebrow">Semana em revisão</span>
              <strong>{currentWeek?.start_date === '2026-09-28' ? '28 de setembro a 2 de outubro' : currentWeek?.label}</strong>
            </div>
            <span>{currentPosts.filter(p => ['aprovada','programada','publicada'].includes(p.status)).length}/5 aprovadas</span>
          </div>

          <p className="muted">
            {currentWeek?.campaign}
          </p>

          <div className="week-strip">
            {currentPosts.map(post => (
              <button
                key={post.id}
                onClick={() => {
                  setEditingPost(post)
                  setPage('editor')
                }}
              >
                <span>
                  {post.weekday.slice(0, 3).toUpperCase()}
                </span>

                <strong>
                  {formatDate(post.post_date)}
                </strong>

                <i className={post.ready ? 'ready' : ''}/>
              </button>
            ))}
          </div>

          <div className="hero-actions">
            <button
              className="btn primary"
              onClick={() => setPage('calendario')}
            >
              Abrir calendário
              <ChevronRight size={16}/>
            </button>
          </div>
        </section>

        <section className="panel next-card">
          <span className="eyebrow">
            Próxima revisão
          </span>

          {next ? (
            <>
              <div className="next-date">
                <CalendarDays size={20}/>

                <strong>
                  {next.weekday}, {formatDate(next.post_date)}
                </strong>
              </div>

              <h3>{next.title}</h3>
              <p>{next.subtitle}</p>

              <button
                className="btn ghost full"
                onClick={() => {
                  setEditingPost(next)
                  setPage('editor')
                }}
              >
                Revisar publicação
              </button>
            </>
          ) : (
            <p className="muted">
              Nada pendente nesta semana.
            </p>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">
              Fluxo seguro
            </span>

            <h3>
              Publicação só é liberada depois da sua aprovação
            </h3>
          </div>
        </div>

        <div className="steps">
          <Step
            n="1"
            title="Criar"
            text="Organize artes, textos e horários."
          />

          <Step
            n="2"
            title="Revisar"
            text="Ajuste a semana ou um dia específico."
          />

          <Step
            n="3"
            title="Aprovar"
            text="A aprovação fica registrada; publicar é uma ação separada e consciente."
          />
        </div>
      </section>
    </>
  )
}

function Stat({
  label,
  value,
  helper,
  compact
}) {
  return (
    <div className="stat-card">
      <span>{label}</span>

      <div className={compact ? 'stat-value compact' : 'stat-value'}>
        {value}
      </div>

      <small>{helper}</small>
    </div>
  )
}

function Step({
  n,
  title,
  text
}) {
  return (
    <div className="step">
      <span>{n}</span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  )
}

function Calendar({
  weeks,
  currentWeek,
  posts,
  setCurrentWeekId,
  setEditingPost,
  setPage,
  onApprove,
  onReopen,
  onBulk,
  onToast
}) {
  const currentPosts = posts
    .filter(p => p.week_id === currentWeek?.id)
    .sort((a, b) => a.post_date.localeCompare(b.post_date))

  return (
    <>
      <PageHeading
        title="Calendário semanal"
        description="Revise cada publicação antes de liberar a semana."
        actions={
          <>
            <button
              className="btn ghost"
              onClick={onBulk}
            >
              <Pencil size={16}/>
              Alterar semana toda
            </button>

            {currentWeek?.status === 'programada'
              ? (
                <button
                  className="btn ghost"
                  disabled
                >
                  <CheckCircle2 size={16}/>
                  Semana programada
                </button>
              )
              : currentWeek?.status === 'aprovada'
                ? (
                  <button
                    className="btn warning"
                    onClick={onReopen}
                  >
                    Voltar para edição
                  </button>
                )
                : (
                  <button
                    className="btn primary"
                    onClick={onApprove}
                  >
                    <CheckCircle2 size={16}/>
                    Aprovar semana
                  </button>
                )
            }
          </>
        }
      />

      <div className="week-selector">
        {weeks.map(w => (
          <button
            key={w.id}
            className={
              w.id === currentWeek?.id
                ? 'active'
                : ''
            }
            onClick={() => setCurrentWeekId(w.id)}
          >
            <strong>{w.label}</strong>
            <StatusBadge status={w.status}/>
          </button>
        ))}
      </div>

      <div className="calendar-grid">
        {currentPosts.map(post => (
          <article
            className="day-card"
            key={post.id}
          >
            <div className="day-card-top">
              <div>
                <span>{post.weekday}</span>
                <strong>{formatDate(post.post_date)}</strong>
              </div>

              <StatusBadge status={post.status}/>
            </div>

            <div className="day-art">
              {post.image_url
                ? (
                  <img
                    src={resolveImage(post.image_url)}
                    alt={post.title}
                  />
                )
                : (
                  <div className="empty-art">
                    <FileImage/>
                    <span>Sem arte</span>
                  </div>
                )
              }
            </div>

            <div className="day-body">
              <span className="eyebrow">
                {post.service}
              </span>

              <h3>
                {post.title || 'Sem título'}
              </h3>

              <p>
                {post.subtitle}
              </p>

              <div className="meta-row">
                <Clock3 size={14}/>
                {toTime(post.publish_time)} · {
                  post.channel === 'ambos'
                    ? 'Instagram + WhatsApp'
                    : post.channel
                }
              </div>

              {post.channel !== 'instagram' && (
                canSharePost(post.status)
                  ? (
                    <button
                      className="btn primary full"
                      onClick={() => shareWhatsAppStatus(post, onToast)}
                    >
                      WhatsApp · Compartilhar status
                    </button>
                  )
                  : (
                    <button
                      className="btn ghost full"
                      disabled
                      title="Disponível somente depois da aprovação"
                    >
                      WhatsApp · Aguardando aprovação
                    </button>
                  )
              )}

              <button
                className="btn ghost full"
                onClick={() => {
                  setEditingPost(post)
                  setPage('editor')
                }}
              >
                Editar dia
                <ChevronRight size={16}/>
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function Editor({
  post,
  assets,
  onSave,
  onBack,
  onToast
}) {
  const [form, setForm] = useState(post || {})

  useEffect(() => {
    setForm(post || {})
  }, [post])

  if (!post) {
    return (
      <div className="panel">
        Selecione uma publicação no calendário.
      </div>
    )
  }

  const imageUrl = resolveImage(form.image_url)

  function field(name, value) {
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function copy(text, label) {
    await navigator.clipboard.writeText(text || '')
    onToast(`${label} copiado.`)
  }

  function download() {
    if (!imageUrl) {
      return onToast(
        'Esta publicação ainda não tem arte.',
        'error'
      )
    }

    const a = document.createElement('a')

    a.href = imageUrl

    a.download =
      `${form.post_date}-${(form.service || 'arte')
        .replace(/\s+/g, '-')
        .toLowerCase()}.png`

    a.target = '_blank'
    a.rel = 'noopener'

    a.click()
  }

  return (
    <>
      <PageHeading
        title={`${post.weekday} · ${formatDate(post.post_date)}`}
        description="Edite textos, horário, status e imagem. A prévia atualiza na hora."
        actions={
          <button
            className="btn ghost"
            onClick={onBack}
          >
            Voltar
          </button>
        }
      />

      <div className="editor-grid">
        <section className="panel form-panel">
          <div className="form-grid two">
            <Field label="Serviço / tema">
              <input
                value={form.service || ''}
                onChange={e => field('service', e.target.value)}
              />
            </Field>

            <Field label="Horário">
              <input
                type="time"
                value={toTime(form.publish_time)}
                onChange={e => field('publish_time', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Título principal">
            <input
              value={form.title || ''}
              onChange={e => field('title', e.target.value)}
            />
          </Field>

          <Field label="Subtítulo">
            <input
              value={form.subtitle || ''}
              onChange={e => field('subtitle', e.target.value)}
            />
          </Field>

          <Field label="Legenda do Instagram">
            <textarea
              rows="6"
              value={form.caption || ''}
              onChange={e => field('caption', e.target.value)}
            />
          </Field>

          <Field label="Texto para Status do WhatsApp">
            <textarea
              rows="3"
              value={form.whatsapp_text || ''}
              onChange={e => field('whatsapp_text', e.target.value)}
            />
          </Field>

          <Field label="Hashtags">
            <textarea
              rows="2"
              value={form.hashtags || ''}
              onChange={e => field('hashtags', e.target.value)}
            />
          </Field>

          <Field label="Imagem / arte">
            <select
              value={form.image_url || ''}
              onChange={e => field('image_url', e.target.value)}
            >
              <option value="">
                Sem imagem
              </option>

              {assets.map(a => (
                <option
                  key={a.id}
                  value={a.public_url}
                >
                  {a.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Observações">
            <textarea
              rows="3"
              value={form.notes || ''}
              onChange={e => field('notes', e.target.value)}
            />
          </Field>

          <div className="form-grid two">
            <Field label="Canal">
              <select
                value={form.channel || 'ambos'}
                onChange={e => field('channel', e.target.value)}
              >
                <option value="ambos">
                  Instagram + WhatsApp
                </option>

                <option value="instagram">
                  Instagram
                </option>

                <option value="whatsapp">
                  WhatsApp
                </option>
              </select>
            </Field>

            <Field label="Status">
              <select
                value={form.status || 'em_criacao'}
                onChange={e => field('status', e.target.value)}
              >
                <option value="em_criacao">
                  Em criação
                </option>

                <option value="para_aprovacao">
                  Para aprovação
                </option>

                <option value="aprovada">
                  Aprovada
                </option>

                <option value="programada" disabled>
                  Programada
                </option>

                <option value="publicada" disabled>
                  Publicada
                </option>
              </select>
            </Field>
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={!!form.ready}
              onChange={e => field('ready', e.target.checked)}
            />

            <span>
              Marcar como pronto para revisão
            </span>
          </label>

          <div className="action-row">
            <button
              className="btn primary"
              onClick={() => onSave(form)}
            >
              <Save size={16}/>
              Salvar alterações
            </button>

            {form.channel !== 'instagram' && (
              canSharePost(form.status)
                ? (
                  <button
                    className="btn primary"
                    onClick={() => shareWhatsAppStatus(form, onToast)}
                  >
                    WhatsApp · Compartilhar status
                  </button>
                )
                : (
                  <button
                    className="btn ghost"
                    disabled
                    title="Disponível somente depois da aprovação"
                  >
                    WhatsApp · Aguardando aprovação
                  </button>
                )
            )}

            <button
              className="btn ghost"
              onClick={() => copy(form.caption, 'Legenda')}
            >
              <Copy size={16}/>
              Copiar legenda
            </button>

            <button
              className="btn ghost"
              onClick={() => copy(form.whatsapp_text, 'Texto do WhatsApp')}
            >
              <Copy size={16}/>
              Copiar WhatsApp
            </button>

            <button
              className="btn ghost"
              onClick={download}
            >
              <Download size={16}/>
              Baixar arte
            </button>
          </div>
        </section>

        <section className="preview-card">
          <div className="preview-top">
            <span>Prévia</span>
            <StatusBadge status={form.status}/>
          </div>

          <div className="preview-art">
            {imageUrl
              ? (
                <img
                  src={imageUrl}
                  alt={form.title}
                />
              )
              : (
                <div className="empty-art">
                  <FileImage/>
                  <span>Escolha uma imagem</span>
                </div>
              )
            }
          </div>

          <div className="preview-copy">
            <strong>{form.title}</strong>
            <span>{form.subtitle}</span>
            <p>{form.caption}</p>
            <small>{form.hashtags}</small>
          </div>
        </section>
      </div>
    </>
  )
}

function Field({
  label,
  children
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function BulkDialog({
  week,
  posts,
  assets,
  onClose,
  onSave
}) {
  const [tab, setTab] = useState('geral')

  const [weekForm, setWeekForm] = useState({
    campaign: week.campaign || '',
    general_instruction: week.general_instruction || '',
    notes: week.notes || '',
    default_time: toTime(week.default_time)
  })

  const [days, setDays] = useState(() =>
    Object.fromEntries(
      posts.map(p => [
        p.id,
        {
          ...p,
          publish_time: toTime(p.publish_time)
        }
      ])
    )
  )

  const selected =
    tab === 'geral'
      ? null
      : days[tab]

  function updateDay(name, value) {
    setDays(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [name]: value
      }
    }))
  }

  return (
    <div className="modal-backdrop">
      <div className="bulk-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              Alterar semana toda
            </span>

            <h3>{week.label}</h3>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X size={20}/>
          </button>
        </div>

        <div className="tabs">
          <button
            className={tab === 'geral' ? 'active' : ''}
            onClick={() => setTab('geral')}
          >
            Geral
          </button>

          {posts.map(p => (
            <button
              key={p.id}
              className={tab === p.id ? 'active' : ''}
              onClick={() => setTab(p.id)}
            >
              {p.weekday}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === 'geral'
            ? (
              <div className="form-stack">
                <Field label="Campanha da semana">
                  <input
                    value={weekForm.campaign}
                    onChange={e =>
                      setWeekForm({
                        ...weekForm,
                        campaign: e.target.value
                      })
                    }
                  />
                </Field>

                <Field label="Instrução geral">
                  <textarea
                    rows="5"
                    value={weekForm.general_instruction}
                    onChange={e =>
                      setWeekForm({
                        ...weekForm,
                        general_instruction: e.target.value
                      })
                    }
                  />
                </Field>

                <Field label="Horário padrão">
                  <input
                    type="time"
                    value={weekForm.default_time}
                    onChange={e =>
                      setWeekForm({
                        ...weekForm,
                        default_time: e.target.value
                      })
                    }
                  />
                </Field>

                <Field label="Observações">
                  <textarea
                    rows="4"
                    value={weekForm.notes}
                    onChange={e =>
                      setWeekForm({
                        ...weekForm,
                        notes: e.target.value
                      })
                    }
                  />
                </Field>
              </div>
            )
            : (
              <div className="form-stack">
                <div className="form-grid two">
                  <Field label="Serviço">
                    <input
                      value={selected.service}
                      onChange={e =>
                        updateDay('service', e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Horário">
                    <input
                      type="time"
                      value={selected.publish_time}
                      onChange={e =>
                        updateDay('publish_time', e.target.value)
                      }
                    />
                  </Field>
                </div>

                <Field label="Título">
                  <input
                    value={selected.title}
                    onChange={e =>
                      updateDay('title', e.target.value)
                    }
                  />
                </Field>

                <Field label="Subtítulo">
                  <input
                    value={selected.subtitle}
                    onChange={e =>
                      updateDay('subtitle', e.target.value)
                    }
                  />
                </Field>

                <Field label="Imagem / arte">
                  <select
                    value={selected.image_url || ''}
                    onChange={e =>
                      updateDay('image_url', e.target.value)
                    }
                  >
                    <option value="">
                      Sem imagem
                    </option>

                    {assets
                      .filter(a => a.type !== 'logo')
                      .map(a => (
                        <option
                          key={a.id}
                          value={a.public_url}
                        >
                          {a.name}
                        </option>
                      ))
                    }
                  </select>
                </Field>

                <Field label="Legenda">
                  <textarea
                    rows="5"
                    value={selected.caption}
                    onChange={e =>
                      updateDay('caption', e.target.value)
                    }
                  />
                </Field>

                <Field label="WhatsApp">
                  <textarea
                    rows="3"
                    value={selected.whatsapp_text}
                    onChange={e =>
                      updateDay('whatsapp_text', e.target.value)
                    }
                  />
                </Field>

                <Field label="Hashtags">
                  <textarea
                    rows="2"
                    value={selected.hashtags}
                    onChange={e =>
                      updateDay('hashtags', e.target.value)
                    }
                  />
                </Field>
              </div>
            )
          }
        </div>

        <div className="modal-foot">
          <button
            className="btn ghost"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="btn primary"
            onClick={() =>
              onSave(
                weekForm,
                Object.values(days)
              )
            }
          >
            <Save size={16}/>
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}

function Library({
  assets,
  onUpload,
  onDelete
}) {
  const [filter, setFilter] = useState('todos')

  const shown = assets.filter(
    a => filter === 'todos' || a.type === filter
  )

  return (
    <>
      <PageHeading
        title="Biblioteca"
        description="Logo oficial, artes aprovadas, fotos, modelos e referências."
        actions={
          <label className="btn primary upload-label">
            <Upload size={16}/>
            Enviar imagem

            <input
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files?.[0]) {
                  onUpload(e.target.files[0])
                }

                e.target.value = ''
              }}
            />
          </label>
        }
      />

      <div className="toolbar">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="todos">
            Todos os tipos
          </option>

          <option value="logo">
            Logo oficial
          </option>

          <option value="arte_aprovada">
            Arte aprovada
          </option>

          <option value="foto">
            Foto de produção
          </option>

          <option value="modelo">
            Modelo
          </option>

          <option value="referencia">
            Referência
          </option>
        </select>
      </div>

      <div className="library-grid">
        {shown.map(asset => (
          <article
            className="asset-card"
            key={asset.id}
          >
            <div className="asset-img">
              <img
                src={resolveImage(asset.public_url)}
                alt={asset.name}
              />
            </div>

            <div className="asset-body">
              <div>
                <strong>{asset.name}</strong>

                <span>
                  {asset.type.replace('_', ' ')} · {formatDateTime(asset.created_at)}
                </span>
              </div>

              {!String(asset.id).startsWith('seed-') && (
                <button
                  className="icon-btn danger"
                  onClick={() => onDelete(asset)}
                >
                  <X size={16}/>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function HistoryPage({
  weeks,
  onSelect,
  onDuplicate
}) {
  return (
    <>
      <PageHeading
        title="Histórico"
        description="Abra semanas anteriores sem alterar a semana atual."
      />

      <div className="history-list">
        {weeks.map(w => (
          <article
            className="panel history-card"
            key={w.id}
          >
            <div>
              <span className="eyebrow">
                {w.start_date} → {w.end_date}
              </span>

              <h3>{w.label}</h3>
              <p>{w.campaign}</p>
            </div>

            <div className="history-actions">
              <StatusBadge status={w.status}/>

              <button
                className="btn ghost"
                onClick={() => onSelect(w.id)}
              >
                Abrir
              </button>

              <button
                className="btn ghost"
                onClick={() => onDuplicate(w.id)}
              >
                Duplicar
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function SettingsPage({
  settings,
  onSave
}) {
  const [form, setForm] = useState(settings || {})

  useEffect(() => {
    setForm(settings || {})
  }, [settings])

  return (
    <>
      <PageHeading
        title="Configurações"
        description="Dados da marca e padrões usados no calendário."
      />

      <section className="panel settings-panel">
        <div className="form-grid two">
          <Field label="Nome da marca">
            <input
              value={form.brand_name || ''}
              onChange={e =>
                setForm({
                  ...form,
                  brand_name: e.target.value
                })
              }
            />
          </Field>

          <Field label="Instagram">
            <input
              value={form.instagram || ''}
              onChange={e =>
                setForm({
                  ...form,
                  instagram: e.target.value
                })
              }
            />
          </Field>

          <Field label="WhatsApp">
            <input
              value={form.whatsapp || ''}
              onChange={e =>
                setForm({
                  ...form,
                  whatsapp: e.target.value
                })
              }
            />
          </Field>

          <Field label="Horário padrão">
            <input
              type="time"
              value={toTime(form.default_time)}
              onChange={e =>
                setForm({
                  ...form,
                  default_time: e.target.value
                })
              }
            />
          </Field>
        </div>

        <Field label="Slogan">
          <input
            value={form.slogan || ''}
            onChange={e =>
              setForm({
                ...form,
                slogan: e.target.value
              })
            }
          />
        </Field>

        <Field label="Fuso horário">
          <input
            value={form.timezone || ''}
            onChange={e =>
              setForm({
                ...form,
                timezone: e.target.value
              })
            }
          />
        </Field>

        <div className="checks">
          <label>
            <input
              type="checkbox"
              checked={!!form.instagram_enabled}
              onChange={e =>
                setForm({
                  ...form,
                  instagram_enabled: e.target.checked
                })
              }
            />

            Instagram ativo
          </label>

          <label>
            <input
              type="checkbox"
              checked={!!form.whatsapp_enabled}
              onChange={e =>
                setForm({
                  ...form,
                  whatsapp_enabled: e.target.checked
                })
              }
            />

            WhatsApp ativo
          </label>
        </div>

        <div className="notice-box">
          <strong>
            Publicação integrada
          </strong>

          <p>
            Depois da aprovação, nada é publicado automaticamente. Para o WhatsApp Status, use o botão Compartilhar
            status no celular para enviar arte e texto em um toque.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={() => onSave(form)}
        >
          <Save size={16}/>
          Salvar configurações
        </button>
      </section>
    </>
  )
}

function NewWeekDialog({
  onClose,
  onCreate,
  title = 'Criar nova semana'
}) {
  const [date, setDate] = useState('')

  return (
    <div className="modal-backdrop">
      <div className="small-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              Calendário
            </span>

            <h3>{title}</h3>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X/>
          </button>
        </div>

        <div className="modal-body">
          <Field label="Data da segunda-feira">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </Field>
        </div>

        <div className="modal-foot">
          <button
            className="btn ghost"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="btn primary"
            onClick={() => date && onCreate(date)}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(false)

  const [weeks, setWeeks] = useState([])
  const [posts, setPosts] = useState([])
  const [dbAssets, setDbAssets] = useState([])
  const [settings, setSettings] = useState(null)

  const [currentWeekId, setCurrentWeekId] = useState(
    localStorage.getItem('immagine-current-week') ||
    '2026-09-28'
  )

  const [page, setPage] = useState('dashboard')
  const [editingPost, setEditingPost] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [newWeek, setNewWeek] = useState(false)
  const [duplicateSource, setDuplicateSource] = useState(null)

  function notify(message, type = 'ok') {
    setToast({
      message,
      type
    })

    window.clearTimeout(window.__immagineToast)

    window.__immagineToast = setTimeout(
      () => setToast(null),
      3400
    )
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
        setAuthLoading(false)
      })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, s) => setSession(s)
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  useEffect(() => {
    localStorage.setItem(
      'immagine-current-week',
      currentWeekId
    )
  }, [currentWeekId])

  async function loadData() {
    setLoading(true)

    try {
      const [w, p, a, s] = await Promise.all([
        supabase
          .from('weeks')
          .select('*')
          .order('start_date', { ascending: false }),

        supabase
          .from('posts')
          .select('*')
          .order('post_date', { ascending: true }),

        supabase
          .from('assets')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle(),
      ])

      if (w.error) throw w.error
      if (p.error) throw p.error
      if (a.error) throw a.error
      if (s.error) throw s.error

      // Garante que a semana operacional correta exista. Se a matriz visual
      // aprovada ainda não estiver cadastrada, criamos somente os slots,
      // sem inventar novas artes.
      if (!w.data?.some(x => x.id === '2026-09-28')) {
        const reviewWeek = {
          id: '2026-09-28',
          label: '28 de setembro a 2 de outubro de 2026',
          start_date: '2026-09-28',
          end_date: '2026-10-02',
          status: 'para_aprovacao',
          campaign: 'Semana 28/09–02/10',
          general_instruction: 'Usar exclusivamente a matriz visual aprovada de 17–21/08.',
          notes: 'Não publicar nem agendar antes da aprovação explícita.',
          default_time: toTime(s.data?.default_time)
        }

        const wi = await supabase.from('weeks').insert(reviewWeek).select().single()
        if (wi.error) throw wi.error
        w.data = [wi.data, ...(w.data || [])]

        const weekdays = ['Segunda','Terça','Quarta','Quinta','Sexta']
        const reviewPosts = weekdays.map((weekday, i) => {
          const date = addDays('2026-09-28', i)
          return {
            id: date,
            week_id: '2026-09-28',
            post_date: date,
            weekday,
            service: '',
            title: 'Arte pendente — aguardando matriz aprovada',
            subtitle: 'Referência oficial: artes aprovadas de 17–21/08.',
            caption: '',
            whatsapp_text: '',
            hashtags: '#ComunicacaoVisual #Immagine #SaoJoseDoRioPreto',
            image_url: null,
            publish_time: toTime(s.data?.default_time),
            channel: 'ambos',
            notes: 'Não improvisar outro layout.',
            status: 'para_aprovacao',
            ready: false
          }
        })

        const pi = await supabase.from('posts').insert(reviewPosts).select()
        if (pi.error) throw pi.error
        p.data = [...(p.data || []), ...(pi.data || [])]
      }

      setWeeks(w.data || [])
      setPosts(p.data || [])
      setDbAssets(a.data || [])
      setSettings(s.data)

      const targetWeek = w.data?.find(x => x.id === '2026-09-28')
      const selectedExists = w.data?.some(x => x.id === currentWeekId)

      // A semana operacional atual é 28/09–02/10. Migra automaticamente
      // quem ainda ficou preso à semana anterior no localStorage.
      if (targetWeek && (!selectedExists || currentWeekId === '2026-09-21')) {
        setCurrentWeekId(targetWeek.id)
      } else if (!selectedExists && w.data?.[0]) {
        setCurrentWeekId(w.data[0].id)
      }

    } catch (err) {
      notify(
        err.message || 'Falha ao carregar dados.',
        'error'
      )

    } finally {
      setLoading(false)
    }
  }

  const currentWeek =
    weeks.find(w => w.id === currentWeekId) ||
    weeks[0]

  const assets = useMemo(() => {
    const map = new Map()

    ;[...LOCAL_ASSETS, ...dbAssets].forEach(a =>
      map.set(a.name, a)
    )

    return [...map.values()]
  }, [dbAssets])

  async function savePost(form) {
    const patch = {
      service: form.service,
      title: form.title,
      subtitle: form.subtitle,
      caption: form.caption,
      whatsapp_text: form.whatsapp_text,
      hashtags: form.hashtags,
      image_url: form.image_url || null,
      publish_time: toTime(form.publish_time),
      channel: form.channel,
      notes: form.notes,
      status: form.status,
      ready: !!form.ready
    }

    const {
      data,
      error
    } = await supabase
      .from('posts')
      .update(patch)
      .eq('id', form.id)
      .select()
      .single()

    if (error) {
      return notify(
        error.message,
        'error'
      )
    }

    setPosts(prev =>
      prev.map(p =>
        p.id === data.id
          ? data
          : p
      )
    )

    setEditingPost(data)

    notify(
      'Publicação salva com sucesso.'
    )
  }

  async function approveWeek() {
    if (!currentWeek) return

    if (
      !window.confirm(
        'Aprovar esta semana? Esta ação registra a aprovação, mas não publica nem agenda nada automaticamente.'
      )
    ) {
      return
    }

    const ids = posts
      .filter(
        p =>
          p.week_id === currentWeek.id &&
          p.status !== 'publicada'
      )
      .map(p => p.id)

    const approvedAt = new Date().toISOString()

    const w = await supabase
      .from('weeks')
      .update({
        status: 'aprovada',
        approved_at: approvedAt
      })
      .eq('id', currentWeek.id)

    if (w.error) {
      return notify(
        w.error.message,
        'error'
      )
    }

    if (ids.length) {
      const p = await supabase
        .from('posts')
        .update({
          status: 'aprovada',
          ready: true
        })
        .in('id', ids)

      if (p.error) {
        return notify(
          p.error.message,
          'error'
        )
      }
    }

    await supabase
      .from('approval_logs')
      .insert({
        week_id: currentWeek.id,
        action: 'approved',
        details: {
          source: 'web'
        }
      })

    // Aprovação e publicação são etapas separadas.
    // Nenhuma integração externa é acionada automaticamente aqui.
    await loadData()

    notify(
      'Semana aprovada. Nenhuma publicação ou programação foi realizada.'
    )
  }

  async function reopenWeek() {
    if (
      !currentWeek ||
      !window.confirm(
        'Voltar esta semana para edição?'
      )
    ) {
      return
    }

    const hasScheduled = posts.some(
      p =>
        p.week_id === currentWeek.id &&
        p.buffer_post_id
    )

    if (hasScheduled) {
      return notify(
        'Esta semana já possui publicações programadas. Para evitar divergências, altere os posts individualmente ou aguarde antes de reabrir a semana.',
        'error'
      )
    }

    const ids = posts
      .filter(
        p =>
          p.week_id === currentWeek.id &&
          p.status !== 'publicada'
      )
      .map(p => p.id)

    const w = await supabase
      .from('weeks')
      .update({
        status: 'em_criacao',
        approved_at: null
      })
      .eq('id', currentWeek.id)

    if (w.error) {
      return notify(
        w.error.message,
        'error'
      )
    }

    if (ids.length) {
      await supabase
        .from('posts')
        .update({
          status: 'em_criacao'
        })
        .in('id', ids)
    }

    await supabase
      .from('approval_logs')
      .insert({
        week_id: currentWeek.id,
        action: 'reopened',
        details: {
          source: 'web'
        }
      })

    await loadData()

    notify(
      'Semana voltou para edição.'
    )
  }

  async function saveBulk(
    weekForm,
    dayForms
  ) {
    const w = await supabase
      .from('weeks')
      .update({
        campaign: weekForm.campaign,
        general_instruction: weekForm.general_instruction,
        notes: weekForm.notes,
        default_time: weekForm.default_time
      })
      .eq('id', currentWeek.id)

    if (w.error) {
      return notify(
        w.error.message,
        'error'
      )
    }

    const payload = dayForms.map(d => ({
      id: d.id,
      week_id: d.week_id,
      post_date: d.post_date,
      weekday: d.weekday,
      service: d.service,
      title: d.title,
      subtitle: d.subtitle,
      caption: d.caption,
      whatsapp_text: d.whatsapp_text,
      hashtags: d.hashtags,
      image_url: d.image_url,
      publish_time: d.publish_time,
      channel: d.channel,
      notes: d.notes,
      status: d.status,
      ready: d.ready
    }))

    const p = await supabase
      .from('posts')
      .upsert(
        payload,
        {
          onConflict: 'id'
        }
      )

    if (p.error) {
      return notify(
        p.error.message,
        'error'
      )
    }

    setBulkOpen(false)

    await loadData()

    notify(
      'Semana atualizada.'
    )
  }

  async function uploadAsset(file) {
    if (file.size > 8_000_000) {
      return notify(
        'Use imagens com até 8 MB.',
        'error'
      )
    }

    const safe = file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')

    const path =
      `${Date.now()}-${safe}`

    const up = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .upload(
        path,
        file,
        {
          upsert: false,
          contentType: file.type
        }
      )

    if (up.error) {
      return notify(
        up.error.message,
        'error'
      )
    }

    const {
      data: { publicUrl }
    } = supabase
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    const ins = await supabase
      .from('assets')
      .insert({
        name: file.name,
        type: 'foto',
        storage_path: path,
        public_url: publicUrl
      })
      .select()
      .single()

    if (ins.error) {
      return notify(
        ins.error.message,
        'error'
      )
    }

    setDbAssets(prev => [
      ins.data,
      ...prev
    ])

    notify(
      'Imagem adicionada à biblioteca.'
    )
  }

  async function deleteAsset(asset) {
    if (
      !window.confirm(
        `Remover ${asset.name}?`
      )
    ) {
      return
    }

    if (asset.storage_path) {
      await supabase
        .storage
        .from(STORAGE_BUCKET)
        .remove([
          asset.storage_path
        ])
    }

    const r = await supabase
      .from('assets')
      .delete()
      .eq('id', asset.id)

    if (r.error) {
      return notify(
        r.error.message,
        'error'
      )
    }

    setDbAssets(prev =>
      prev.filter(
        a => a.id !== asset.id
      )
    )

    notify(
      'Imagem removida.'
    )
  }

  async function saveSettings(form) {
    const patch = {
      brand_name: form.brand_name,
      whatsapp: form.whatsapp,
      instagram: form.instagram,
      slogan: form.slogan,
      default_time: toTime(form.default_time),
      timezone: form.timezone,
      instagram_enabled: !!form.instagram_enabled,
      whatsapp_enabled: !!form.whatsapp_enabled
    }

    const r = await supabase
      .from('settings')
      .update(patch)
      .eq('id', 1)
      .select()
      .single()

    if (r.error) {
      return notify(
        r.error.message,
        'error'
      )
    }

    setSettings(r.data)

    notify(
      'Configurações salvas.'
    )
  }

  async function createWeek(
    startDate,
    source = null
  ) {
    const end = addDays(
      startDate,
      4
    )

    const weekdays = [
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta'
    ]

    const basePosts = source
      ? posts
        .filter(p => p.week_id === source.id)
        .sort((a, b) =>
          a.post_date.localeCompare(b.post_date)
        )
      : []

    const week = {
      id: startDate,
      label: weekLabel(startDate),
      start_date: startDate,
      end_date: end,
      status: 'em_criacao',
      campaign: source?.campaign || '',
      general_instruction: source?.general_instruction || '',
      notes: '',
      default_time: toTime(
        source?.default_time ||
        settings?.default_time
      )
    }

    const wi = await supabase
      .from('weeks')
      .insert(week)

    if (wi.error) {
      return notify(
        wi.error.message,
        'error'
      )
    }

    const rows = weekdays.map(
      (weekday, i) => {
        const src = basePosts[i]
        const date = addDays(startDate, i)

        return {
          id: date,
          week_id: startDate,
          post_date: date,
          weekday,
          service: src?.service || '',
          title: src?.title || '',
          subtitle: src?.subtitle || '',
          caption: src?.caption || '',
          whatsapp_text: src?.whatsapp_text || '',
          hashtags:
            src?.hashtags ||
            '#ComunicacaoVisual #Immagine #SaoJoseDoRioPreto',
          image_url: src?.image_url || null,
          publish_time: toTime(
            src?.publish_time ||
            settings?.default_time
          ),
          channel: src?.channel || 'ambos',
          notes: '',
          status: 'em_criacao',
          ready: false
        }
      }
    )

    const pi = await supabase
      .from('posts')
      .insert(rows)

    if (pi.error) {
      return notify(
        pi.error.message,
        'error'
      )
    }

    setNewWeek(false)
    setDuplicateSource(null)
    setCurrentWeekId(startDate)
    setPage('calendario')

    await loadData()

    notify(
      'Nova semana criada.'
    )
  }

  async function ensureReviewWeek() {
    const startDate = '2026-09-28'
    const endDate = '2026-10-02'

    const existingWeek = weeks.find(w => w.id === startDate)
    const existingPosts = posts.filter(p => p.week_id === startDate)

    if (!existingWeek) {
      const wi = await supabase.from('weeks').insert({
        id: startDate,
        label: '28 de setembro a 2 de outubro de 2026',
        start_date: startDate,
        end_date: endDate,
        status: 'para_aprovacao',
        campaign: 'Semana 28/09–02/10',
        general_instruction: 'Usar exclusivamente a matriz visual aprovada da Immagine. Não publicar nem agendar antes da aprovação.',
        notes: 'Artes aguardando a matriz aprovada de 17–21/08.',
        default_time: toTime(settings?.default_time)
      })
      if (wi.error) return notify(wi.error.message, 'error')
    }

    if (existingPosts.length < 5) {
      const weekdays = ['Segunda','Terça','Quarta','Quinta','Sexta']
      const missing = weekdays.map((weekday, i) => {
        const date = addDays(startDate, i)
        return {
          id: date,
          week_id: startDate,
          post_date: date,
          weekday,
          service: '',
          title: 'Arte pendente — aguardando matriz aprovada',
          subtitle: 'Referência oficial: artes aprovadas de 17–21/08.',
          caption: '',
          whatsapp_text: '',
          hashtags: '#ComunicacaoVisual #Immagine #SaoJoseDoRioPreto',
          image_url: null,
          publish_time: toTime(settings?.default_time),
          channel: 'ambos',
          notes: 'Não improvisar novo layout. Inserir somente após recuperar a matriz aprovada.',
          status: 'para_aprovacao',
          ready: false
        }
      }).filter(row => !existingPosts.some(p => p.id === row.id))

      if (missing.length) {
        const pi = await supabase.from('posts').insert(missing)
        if (pi.error) return notify(pi.error.message, 'error')
      }
    }

    setCurrentWeekId(startDate)
    await loadData()
    notify('Semana 28/09–02/10 preparada para revisão, sem publicação automática.')
  }

  async function signOut() {
    await supabase.auth.signOut()

    setWeeks([])
    setPosts([])
    setPage('dashboard')
  }

  if (authLoading) {
    return (
      <div className="loading-screen">
        <RefreshCw className="spin"/>
        <span>Carregando...</span>
      </div>
    )
  }

  if (!session) {
    return (
      <>
        <Login onToast={notify}/>
        <Toast toast={toast}/>
      </>
    )
  }

  let content

  if (loading && !weeks.length) {
    content = (
      <div className="loading-panel">
        <RefreshCw className="spin"/>
        Carregando painel...
      </div>
    )

  } else if (page === 'dashboard') {
    content = (
      <Dashboard
        weeks={weeks}
        currentWeek={currentWeek}
        posts={posts}
        setPage={setPage}
        setEditingPost={setEditingPost}
        onNewWeek={() => setNewWeek(true)}
      />
    )

  } else if (page === 'calendario') {
    content = (
      <Calendar
        weeks={weeks}
        currentWeek={currentWeek}
        posts={posts}
        setCurrentWeekId={setCurrentWeekId}
        setEditingPost={setEditingPost}
        setPage={setPage}
        onApprove={approveWeek}
        onReopen={reopenWeek}
        onBulk={() => setBulkOpen(true)}
        onToast={notify}
      />
    )

  } else if (page === 'editor') {
    content = (
      <Editor
        post={editingPost}
        assets={assets.filter(a => a.type !== 'logo')}
        onSave={savePost}
        onBack={() => setPage('calendario')}
        onToast={notify}
      />
    )

  } else if (page === 'biblioteca') {
    content = (
      <Library
        assets={assets}
        onUpload={uploadAsset}
        onDelete={deleteAsset}
      />
    )

  } else if (page === 'historico') {
    content = (
      <HistoryPage
        weeks={weeks}
        onSelect={id => {
          setCurrentWeekId(id)
          setPage('calendario')
        }}
        onDuplicate={id =>
          setDuplicateSource(
            weeks.find(w => w.id === id)
          )
        }
      />
    )

  } else {
    content = (
      <SettingsPage
        settings={settings}
        onSave={saveSettings}
      />
    )
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="app-main">
        <Header
          setMobileOpen={setMobileOpen}
          session={session}
          onSignOut={signOut}
        />

        <main>
          {content}
        </main>
      </div>

      <Toast toast={toast}/>

      {bulkOpen && currentWeek && (
        <BulkDialog
          week={currentWeek}
          assets={assets}
          posts={posts
            .filter(p => p.week_id === currentWeek.id)
            .sort((a, b) =>
              a.post_date.localeCompare(b.post_date)
            )
          }
          onClose={() => setBulkOpen(false)}
          onSave={saveBulk}
        />
      )}

      {newWeek && (
        <NewWeekDialog
          onClose={() => setNewWeek(false)}
          onCreate={d => createWeek(d)}
        />
      )}

      {duplicateSource && (
        <NewWeekDialog
          title={`Duplicar ${duplicateSource.label}`}
          onClose={() => setDuplicateSource(null)}
          onCreate={d =>
            createWeek(
              d,
              duplicateSource
            )
          }
        />
      )}
    </div>
  )
}

export default App
