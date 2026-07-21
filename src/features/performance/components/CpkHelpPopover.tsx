import { useEffect, useId, useRef, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import { getCpkLevel, type CpkLevel } from '../cpkHelpers'

interface CpkHelpPopoverProps {
  cpk: number
}

const RANGE_LEVELS: CpkLevel[] = ['green', 'yellow', 'red']

export function CpkHelpPopover({ cpk }: CpkHelpPopoverProps) {
  const { t } = useLanguage()
  const d = t.performance
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const activeLevel = getCpkLevel(cpk)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const rangeContent: Record<
    CpkLevel,
    { label: string; values: string; description: string }
  > = {
    green: {
      label: d.cpkRangeGreenLabel,
      values: d.cpkRangeGreenValues,
      description: d.cpkRangeGreen,
    },
    yellow: {
      label: d.cpkRangeYellowLabel,
      values: d.cpkRangeYellowValues,
      description: d.cpkRangeYellow,
    },
    red: {
      label: d.cpkRangeRedLabel,
      values: d.cpkRangeRedValues,
      description: d.cpkRangeRed,
    },
  }

  return (
    <div className="cpk-help" ref={rootRef}>
      <button
        type="button"
        className="cpk-help__trigger"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <HelpCircle size={14} aria-hidden="true" />
        {d.cpkHelpTrigger}
      </button>

      {open && (
        <div
          id={titleId}
          className="cpk-help__popover"
          role="dialog"
          aria-labelledby={`${titleId}-title`}
        >
          <h3 id={`${titleId}-title`} className="cpk-help__title">
            {d.cpkHelpTitle}
          </h3>
          <p className="cpk-help__intro">{d.cpkHelpIntro}</p>
          <ul className="cpk-help__ranges">
            {RANGE_LEVELS.map((level) => (
              <li
                key={level}
                className={`cpk-help__range cpk-help__range--${level}${activeLevel === level ? ' cpk-help__range--current' : ''}`}
              >
                <span className="cpk-help__swatch" aria-hidden="true" />
                <div className="cpk-help__range-copy">
                  <div className="cpk-help__range-head">
                    <strong>{rangeContent[level].label}</strong>
                    <span className="cpk-help__range-values">{rangeContent[level].values}</span>
                  </div>
                  <p>{rangeContent[level].description}</p>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="cpk-help__close" onClick={() => setOpen(false)}>
            {d.cpkHelpClose}
          </button>
        </div>
      )}
    </div>
  )
}
