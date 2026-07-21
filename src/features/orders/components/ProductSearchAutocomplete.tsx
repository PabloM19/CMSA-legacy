import { RefreshCw, Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { FormField, Input } from '../../../components/ui/FormField'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { MockProduct } from '../../../data/mockProducts'
import {
  getReferenceHeights,
  getReferencePalletType,
} from '../../../utils/referenceDisplayHelpers'
import { getDisplayProducts, isSearchActive } from '../../../utils/productSearch'

interface ProductSearchAutocompleteProps {
  selectedProduct: MockProduct | null
  error?: string
  onSelect: (product: MockProduct) => void
  onClearSelection: () => void
}

function ProductSuggestionOption({
  product,
  active,
  id,
  onSelect,
  onHighlight,
}: {
  product: MockProduct
  active: boolean
  id: string
  onSelect: (product: MockProduct) => void
  onHighlight: () => void
}) {
  const { t } = useLanguage()
  const d = t.newOrder
  const palletType = getReferencePalletType(product)
  const heights = getReferenceHeights(product)

  return (
    <button
      type="button"
      role="option"
      id={id}
      aria-selected={active}
      className={`product-search__option${active ? ' product-search__option--active' : ''}`}
      onMouseEnter={onHighlight}
      onClick={() => onSelect(product)}
    >
      <span className="product-search__option-ref">{product.referenciaProducto}</span>
      <span className="product-search__option-line">
        {product.producto} {product.variedad} · {product.barcode}
      </span>
      <span className="product-search__option-pallet">
        <span className="product-search__option-dot product-search__option-dot--pallet" aria-hidden="true" />
        {palletType} · {heights} {d.heightsUnit}
      </span>
    </button>
  )
}

export function ProductSearchAutocomplete({
  selectedProduct,
  error,
  onSelect,
  onClearSelection,
}: ProductSearchAutocompleteProps) {
  const { t } = useLanguage()
  const d = t.newOrder
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [pendingFocus, setPendingFocus] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(false)

  const results = getDisplayProducts(query)
  const searching = isSearchActive(query)

  function close() {
    setOpen(false)
    setHighlightedIndex(0)
  }

  useEffect(() => {
    if (!selectedProduct && pendingFocus) {
      setOpen(true)
      window.requestAnimationFrame(() => inputRef.current?.focus())
      setPendingFocus(false)
    }
  }, [selectedProduct, pendingFocus])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [query])

  useEffect(() => {
    const list = listRef.current
    if (!list || !open) {
      setShowScrollHint(false)
      return
    }

    function updateScrollHint() {
      if (!list) return
      const overflow = list.scrollHeight - list.clientHeight > 8
      const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 4
      setShowScrollHint(overflow && !atBottom)
    }

    updateScrollHint()
    list.addEventListener('scroll', updateScrollHint, { passive: true })
    return () => list.removeEventListener('scroll', updateScrollHint)
  }, [open, results.length])

  function handleSelect(product: MockProduct) {
    onSelect(product)
    setQuery('')
    close()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true)
      return
    }

    if (event.key === 'Escape') {
      close()
      return
    }

    if (!open || results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % results.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length)
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const product = results[highlightedIndex]
      if (product) handleSelect(product)
    }
  }

  if (selectedProduct) {
    const palletType = getReferencePalletType(selectedProduct)
    const heights = getReferenceHeights(selectedProduct)

    return (
      <div className="product-selected dash-card">
        <div className="product-selected__head">
          <h3 className="product-selected__title">{d.selectedProductTitle}</h3>
          <button
            type="button"
            className="product-selected__change"
            onClick={() => {
              onClearSelection()
              setPendingFocus(true)
            }}
          >
            <RefreshCw size={14} strokeWidth={2} aria-hidden="true" />
            {d.changeProduct}
          </button>
        </div>
        <p className="product-selected__ref">{selectedProduct.referenciaProducto}</p>
        <p className="product-selected__name">{selectedProduct.nombre}</p>
        <div className="product-selected__barcode">
          <span className="product-selected__barcode-label">{d.barcode}</span>
          <span className="product-selected__barcode-value">{selectedProduct.barcode}</span>
        </div>
        <p className="product-selected__meta">
          {selectedProduct.producto} · {selectedProduct.variedad} · {selectedProduct.calibre} ·{' '}
          {selectedProduct.uso} · {selectedProduct.formatoCaja}
        </p>
        <p className="product-selected__pallet">
          <span className="product-search__option-dot product-search__option-dot--pallet" aria-hidden="true" />
          {palletType} · {heights} {d.heightsUnit}
        </p>
      </div>
    )
  }

  return (
    <div ref={rootRef} className="product-search">
      <FormField
        label={d.searchProduct}
        htmlFor="product-search"
        hint={d.searchProductHint}
        error={error}
        className="new-order-step__full"
      >
        <div className="product-search__input-wrap">
          <Search size={18} className="product-search__icon" aria-hidden="true" />
          <Input
            ref={inputRef}
            id="product-search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && results[highlightedIndex]
                ? `${listboxId}-option-${highlightedIndex}`
                : undefined
            }
            hasError={Boolean(error)}
            className="product-search__input"
            placeholder={d.searchProductPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              type="button"
              className="product-search__clear"
              aria-label={d.clearSearch}
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
                setOpen(true)
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </FormField>

      {open && (
        <section className="product-search__panel" aria-label={d.featuredProducts}>
          <header className="product-search__panel-head">
            <h3 className="product-search__panel-title">{d.featuredProducts}</h3>
            <p className="product-search__panel-subtitle">
              {searching ? d.suggestedProductsSearchHint : d.suggestedProductsSubtitle}
            </p>
          </header>

          <div
            className={`product-search__list-shell${showScrollHint ? ' product-search__list-shell--fade' : ''}`}
          >
            <div
              ref={listRef}
              className="product-search__list"
              role="listbox"
              id={listboxId}
            >
              {results.length === 0 ? (
                <p className="product-search__empty">
                  {searching ? d.noReferencesFound : d.searchToSeeSuggestions}
                </p>
              ) : (
                results.map((product, index) => (
                  <ProductSuggestionOption
                    key={product.id}
                    product={product}
                    active={highlightedIndex === index}
                    id={`${listboxId}-option-${index}`}
                    onSelect={handleSelect}
                    onHighlight={() => setHighlightedIndex(index)}
                  />
                ))
              )}
            </div>
          </div>

          {showScrollHint && (
            <p className="product-search__scroll-hint">{d.scrollMoreHint}</p>
          )}
        </section>
      )}
    </div>
  )
}
