import { ExternalLink, Mail, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { KeyButton, KeyLink } from '../components/KeyButton'
import { WellIcon } from '../components/WellIcon'
import { pushAudit } from '../services/demoStore'

const presentationUrl = import.meta.env.VITE_PRESENTATION_URL?.trim()

type TrustSceneProps = {
  onOpenDrawer: (title: string, content: ReactNode) => void
  onCloseDrawer: () => void
}

export function TrustScene({ onOpenDrawer, onCloseDrawer }: TrustSceneProps) {
  const [agreeData, setAgreeData] = useState(false)
  const [agreeShare, setAgreeShare] = useState(false)

  const openConsent = () => {
    onOpenDrawer(
      'Согласие на данные (демо)',
      <ConsentDrawerBody
        agreeData={agreeData}
        agreeShare={agreeShare}
        setAgreeData={setAgreeData}
        setAgreeShare={setAgreeShare}
        onCloseDrawer={onCloseDrawer}
      />,
    )
  }

  return (
    <>
      <h1 className="well-title">Безопасность и связь</h1>
      <p className="well-lead">Коротко о правилах. Не юридическая консультация.</p>

      <section className="well-card well-card--pad" aria-labelledby="trust-emergency">
        <h2 id="trust-emergency" className="well-field-label well-trust-section-title">
          Кому звонить
        </h2>
        <ul className="well-readings-list well-readings-list--auto">
          <li className="well-readings-list__row">
            <WellIcon icon={Phone} size={16} aria-hidden />
            <span>
              <strong>Куратор (демо)</strong> — +7 (000) 000-00-01
            </span>
          </li>
          <li className="well-readings-list__row">
            <WellIcon icon={Phone} size={16} aria-hidden />
            <span>
              <strong>Сын</strong> — +7 (000) 000-00-02
            </span>
          </li>
        </ul>
        <p className="well-hint well-stack-sm">Номера вымышленные; в пилоте замените на реальные.</p>
      </section>

      <div className="well-grid-2 well-stack-top">
        <div className="well-card well-card--pad">
          <h3 className="well-metric-k well-trust-subtitle">
            Закон и данные
          </h3>
          <div>
            {['Доступы', 'Журнал', 'Персональные данные', 'Экспорт в ЕС'].map((t) => (
              <span key={t} className="well-tag">
                {t}
              </span>
            ))}
          </div>
          <ul className="well-prose well-stack-top">
            <li>Разные роли — разный доступ.</li>
            <li>Журнал действий для спорных ситуаций.</li>
          </ul>
        </div>

        <div className="well-card well-card--pad">
          <h3 className="well-metric-k well-trust-subtitle">
            Техника
          </h3>
          <ul className="well-prose well-trust-list">
            <li>Можно отдельный контур для чувствительных договоров.</li>
            <li>Человек подтверждает передачу данных и финансовые поручения.</li>
            <li>Критичный код без лишних CDN.</li>
          </ul>
        </div>
      </div>

      <KeyButton variant="secondary" size="md" fullWidth className="well-stack-top" onClick={openConsent}>
        Согласие на обработку данных (демо)
      </KeyButton>

      <div className="well-card well-card--pad well-stack-top well-trust-contact-card">
        <p className="well-hint well-trust-contact-lead">
          Напишите — ответим.
        </p>
        <div className="well-preset-row well-trust-contact-actions">
          <KeyLink variant="primary" size="md" href="mailto:pilot@example.com?subject=%D0%9F%D0%B8%D0%BB%D0%BE%D1%82%20%D0%AF%20%D0%B6%D0%B8%D0%B2%D0%BE%D0%B9" iconLeft={<WellIcon icon={Mail} size={18} />}>
            Пилот
          </KeyLink>
          <KeyLink
            variant="secondary"
            size="md"
            href="mailto:data-room@example.com?subject=%D0%94%D0%B4%20%E2%80%94%20%D0%AF%20%D0%B6%D0%B8%D0%B2%D0%BE%D0%B9"
            iconLeft={<WellIcon icon={Mail} size={18} />}
          >
            Материалы
          </KeyLink>
          {presentationUrl ? (
            <KeyLink variant="ghost" size="md" href={presentationUrl} iconLeft={<WellIcon icon={ExternalLink} size={18} />}>
              Презентация
            </KeyLink>
          ) : null}
        </div>
        <p className="well-note well-stack-top well-trust-note">
          Адреса <code className="well-num">example.com</code> — заглушки для демо; перед публичным пилотом замените на
          реальные контакты в разметке и в документации деплоя.
        </p>
      </div>
    </>
  )
}

function ConsentDrawerBody({
  agreeData,
  agreeShare,
  setAgreeData,
  setAgreeShare,
  onCloseDrawer,
}: {
  agreeData: boolean
  agreeShare: boolean
  setAgreeData: (v: boolean) => void
  setAgreeShare: (v: boolean) => void
  onCloseDrawer: () => void
}) {
  return (
    <div className="well-prose">
      <p>Отметьте, что согласны в демо. В продукте здесь был бы юридический текст и подпись.</p>
      <label className="well-console-check">
        <input type="checkbox" checked={agreeData} onChange={(e) => setAgreeData(e.target.checked)} />
        Обработка данных для ухода и напоминаний
      </label>
      <label className="well-console-check">
        <input type="checkbox" checked={agreeShare} onChange={(e) => setAgreeShare(e.target.checked)} />
        Передача сводок врачу по запросу семьи
      </label>
      <KeyButton
        variant="primary"
        size="md"
        fullWidth
        className="well-stack-top"
        onClick={() => {
          pushAudit({
            actor: 'Пользователь',
            action: `Демо-согласие: данные=${agreeData ? 'да' : 'нет'}, обмен с врачом=${agreeShare ? 'да' : 'нет'}`,
          })
          onCloseDrawer()
        }}
      >
        Записать в журнал демо
      </KeyButton>
    </div>
  )
}
