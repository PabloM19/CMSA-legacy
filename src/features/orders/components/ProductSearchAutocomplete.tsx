import { Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { FormField, Input } from '../../../components/ui/FormField'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { MockProduct } from '../../../data/mockProducts'
import { getDisplayProducts, isSearchActive } from '../../../utils/productSearch'

interface ProductSearchAutocompleteProps {
  selectedProduct: MockProduct | null
  error?: string
  onSelect: (product: MockProduct) => void
  onClearSelection: () => void
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
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [pendingFocus, setPendingFocus] = useState(false)

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
            {d.changeProduct}
          </button>
        </div>
        <p className="product-selected__ref">{selectedProduct.referenciaProducto}</p>
        <p className="product-selected__name">{selectedProduct.nombre}</p>
        <p className="product-selected__meta">
          {selectedProduct.producto} · {selectedProduct.variedad} · {selectedProduct.tipo} ·{' '}
          {selectedProduct.formatoCaja}
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
        <div className="product-search__dropdown" role="listbox" id={listboxId}>
          {!searching && (
            <p className="product-search__dropdown-label">{d.featuredProducts}</p>
          )}
          {results.length === 0 ? (
            <p className="product-search__empty">{d.noProductsFound}</p>
          ) : (
            results.map((product, index) => (
              <button
                key={product.id}
                type="button"
                role="option"
                id={`${listboxId}-option-${index}`}
                aria-selected={highlightedIndex === index}
                className={`product-search__option${highlightedIndex === index ? ' product-search__option--active' : ''}`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(product)}
              >
                <span className="product-search__option-ref">{product.referenciaProducto}</span>
                <span className="product-search__option-name">{product.nombre}</span>
                <span className="product-search__option-meta">
                  {product.producto} · {product.variedad} · {product.formatoCaja}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
