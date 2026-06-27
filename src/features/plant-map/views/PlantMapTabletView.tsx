import { useCallback, useEffect, useMemo, useState } from 'react'
import { BacklogToast } from '../../backlog/components/BacklogToast'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import { PlantElementDrawer } from '../components/PlantElementDrawer'
import { PlantLayout } from '../components/PlantLayout'
import type { PlantElementView } from '../../../types/plant'
import { getState } from '../../../utils/backlogStorage'
import { buildPlantElementMap } from '../../../utils/plantMapHelpers'
import {
  markTabletIncident,
  simulateTabletResume,
  simulateTabletStop,
} from '../../../utils/tabletActions'
import {
  buildTabletAlerts,
  computeGeneralStatus,
  computeTabletKpis,
  getActiveProductionOrders,
} from '../../../utils/tabletHelpers'
import { TabletActiveProduction } from '../../tablet/components/TabletActiveProduction'
import { TabletAlerts } from '../../tablet/components/TabletAlerts'
import { TabletConfirmModal } from '../../tablet/components/TabletConfirmModal'
import {
  TabletDrawerActions,
  type TabletConfirmAction,
} from '../../tablet/components/TabletDrawerActions'
import { TabletHeader } from '../../tablet/components/TabletHeader'
import { TabletStatusCards } from '../../tablet/components/TabletStatusCards'
import '../plant-map.css'
import '../../tablet/tablet.css'

/** Vista tablet — se activa por ancho (768–1099px) dentro de /plant-map */
export function PlantMapTabletView() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.tablet
  const v = t.validation

  const [state, setState] = useState(() => getState())
  const [selected, setSelected] = useState<PlantElementView | null>(null)
  const [confirmAction, setConfirmAction] = useState<TabletConfirmAction | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null,
  )

  useEffect(() => {
    setState(getState())
    setSelected(null)
  }, [])

  const elements = useMemo(
    () => buildPlantElementMap(state.plantTables, state.plantPalletizers, state.orders, lang),
    [state, lang],
  )

  const kpis = useMemo(() => computeTabletKpis(state), [state])
  const generalStatus = useMemo(() => computeGeneralStatus(state), [state])
  const alerts = useMemo(() => buildTabletAlerts(state, lang), [state, lang])
  const activeOrders = useMemo(
    () => getActiveProductionOrders(state.orders, lang),
    [state.orders, lang],
  )

  const selectedLive = selected ? elements.get(selected.id) ?? selected : null

  const refresh = useCallback(() => {
    const next = getState()
    setState(next)
    if (selected) {
      const updated = buildPlantElementMap(
        next.plantTables,
        next.plantPalletizers,
        next.orders,
        lang,
      ).get(selected.id)
      if (updated) setSelected(updated)
    }
  }, [selected, lang])

  function executeAction(action: TabletConfirmAction) {
    if (!selectedLive) return

    if (action === 'incident') {
      markTabletIncident(state, selectedLive, lang)
      setToast({ message: d.feedbackIncident, type: 'success' })
    } else if (action === 'stop') {
      simulateTabletStop(state, selectedLive, lang)
      setToast({ message: d.feedbackStop, type: 'success' })
    } else {
      simulateTabletResume(state, selectedLive)
      setToast({ message: d.feedbackResume, type: 'success' })
    }

    refresh()
    setConfirmAction(null)
  }

  function confirmMessage(action: TabletConfirmAction): string {
    if (action === 'incident') return d.confirmIncident
    if (action === 'stop') return d.confirmStop
    return d.confirmResume
  }

  if (!user) return null

  return (
    <div className="tablet-page tablet-page--fluid">
      <TabletHeader generalStatus={generalStatus} />
      <TabletStatusCards kpis={kpis} />

      <div className="tablet-page__body">
        <section className="tablet-page__map">
          <PlantLayout
            boardClassName="plant-map-board--tablet"
            elements={elements}
            selectedId={selectedLive?.id ?? null}
            onSelect={setSelected}
          />
        </section>

        <aside className="tablet-page__aside">
          <TabletActiveProduction orders={activeOrders} />
          <TabletAlerts alerts={alerts} />
        </aside>
      </div>

      <PlantElementDrawer
        element={selectedLive}
        variant="bottom"
        onClose={() => setSelected(null)}
        footer={
          selectedLive ? (
            <TabletDrawerActions
              element={selectedLive}
              onAction={(action) => setConfirmAction(action)}
            />
          ) : undefined
        }
      />

      {confirmAction && (
        <TabletConfirmModal
          message={confirmMessage(confirmAction)}
          confirmLabel={v.confirm}
          cancelLabel={v.cancel}
          onConfirm={() => executeAction(confirmAction)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {toast && (
        <BacklogToast
          message={toast.message}
          type={toast.type}
          onClear={() => setToast(null)}
        />
      )}
    </div>
  )
}
