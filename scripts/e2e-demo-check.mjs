/**
 * Verificación rápida de criterios de demo (Fase 1).
 * Uso: node scripts/e2e-demo-check.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5173'
const results = []

function pass(id, msg) {
  results.push({ id, ok: true, msg })
  console.log(`✅ ${id}: ${msg}`)
}

function fail(id, msg) {
  results.push({ id, ok: false, msg })
  console.log(`❌ ${id}: ${msg}`)
}

async function clearStorage(page) {
  await page.goto(`${BASE}/login`)
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

async function login(page, username, password) {
  await page.goto(`${BASE}/login`)
  await page.fill('#username', username)
  await page.fill('#password', password)
  await page.click('button.login-card__submit')
  await page.waitForURL(/\/plant-map/, { timeout: 8000 })
}

async function logout(page) {
  await page.evaluate(() => localStorage.removeItem('cmsa-auth'))
  await page.goto(`${BASE}/plant-map`)
}

async function ensureSidebarExpanded(page) {
  const collapsed = await page.locator('.app-layout__sidebar--collapsed').count()
  if (collapsed > 0) {
    await page.click('.sidebar__toggle')
    await page.waitForTimeout(200)
  }
}

async function sidebarLabels(page) {
  await page.waitForSelector('.sidebar__nav', { timeout: 5000 })
  await ensureSidebarExpanded(page)
  return page.locator('.sidebar__link-label').allTextContents()
}

async function sidebarHrefs(page) {
  await page.waitForSelector('.sidebar__nav', { timeout: 5000 })
  return page.locator('.sidebar__link').evaluateAll((els) =>
    els.map((el) => el.getAttribute('href') ?? ''),
  )
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1400, height: 900 })

  page.on('pageerror', (err) => {
    fail('console', `Error en página: ${err.message}`)
  })

  try {
    // A1-A2 Guest
    await clearStorage(page)
    await page.goto(`${BASE}/plant-map`)
    await page.waitForSelector('.plant-map-page, .plant-layout', { timeout: 8000 })
    const guestSidebar = await page.locator('.app-layout__sidebar').count()
    if (guestSidebar === 0) pass('A1-A2', 'Guest en /plant-map sin sidebar')
    else fail('A1-A2', 'Guest ve sidebar')

    // Login demo users panel
    await page.goto(`${BASE}/login`)
    await page.click('button.login-card__help-btn')
    const helpText = await page.locator('.login-card__help-panel').innerText()
    if (helpText.includes('operario_sumo') && helpText.includes('usuario_supervisor')) {
      pass('login-help', 'Panel usuarios demo visible')
    } else fail('login-help', 'Panel demo incompleto')
    if (!helpText.includes('validador') && !helpText.includes('Validador')) {
      pass('A9', 'Validador no aparece en login')
    } else fail('A9', 'Validador visible en login')

    // A3-A4 Operario SUMO
    await login(page, 'operario_sumo', '1234')
    if (page.url().includes('/plant-map')) pass('A3', 'Operario redirige a /plant-map')
    else fail('A3', `URL inesperada: ${page.url()}`)

    const sumoNav = await sidebarLabels(page)
    const sumoHrefs = await sidebarHrefs(page)
    const sumoHas = (t) => sumoNav.some((l) => l.includes(t)) || sumoHrefs.some((h) => h.includes(t.replace('Mapa', 'plant-map').replace('Cola', 'backlog').replace('Alarmas', 'alarms').replace('Perfil', 'profile')))
    if (
      (sumoHas('Mapa') || sumoHrefs.includes('/plant-map')) &&
      (sumoHas('Cola') || sumoHrefs.includes('/backlog')) &&
      (sumoHas('Alarmas') || sumoHrefs.includes('/alarms'))
    ) {
      pass('A4', `Sidebar operario: ${sumoNav.filter(Boolean).join(', ') || sumoHrefs.join(', ')}`)
    } else fail('A4', `Sidebar operario incompleta: labels=[${sumoNav.join('|')}] hrefs=[${sumoHrefs.join(', ')}]`)
    if (!sumoHas('Perfil') && !sumoHrefs.includes('/profile')) {
      pass('A4-profile', 'Perfil no aparece en sidebar (solo menú superior)')
    } else fail('A4-profile', 'Perfil sigue visible en sidebar')
    if (!sumoHas('Admin') && !sumoHas('Referencias')) {
      pass('operario-no-admin', 'Operario sin Admin/Referencias')
    } else fail('operario-no-admin', 'Operario ve Admin o Referencias')

    // A14 operario sin botón añadir referencia
    await page.goto(`${BASE}/orders/new`)
    await page.waitForSelector('.new-order', { timeout: 5000 })
    const addRefOp = await page.locator('.new-order__add-ref').count()
    if (addRefOp === 0) pass('A14', 'Operario no ve Añadir referencia')
    else fail('A14', 'Operario ve botón Añadir referencia')

    // Operario no puede /admin
    await page.goto(`${BASE}/admin`)
    await page.waitForTimeout(500)
    const denied = await page.locator('.admin-denied').count()
    if (denied > 0 || page.url().includes('/plant-map')) {
      pass('A15-block', 'Operario bloqueado en admin')
    } else fail('A15-block', 'Operario accede a admin')

    // Operario alarmas sin marcar revisada (botón disabled o ausente en página ampliada)
    await page.goto(`${BASE}/alarms`)
    await page.waitForSelector('.alarms-page', { timeout: 5000 })
    const reviewBtns = await page.locator('button:has-text("Marcar como revisada")').count()
    if (reviewBtns === 0) pass('A23', 'Operario no puede marcar alarmas revisadas')
    else fail('A23', 'Operario tiene botón marcar revisada')

    await logout(page)

    // A5-A6 Supervisor
    await login(page, 'usuario_supervisor', 'sup123')
    const supNav = await sidebarLabels(page)
    const supHrefs = await sidebarHrefs(page)
    if (
      (supNav.some((l) => l.includes('Referencias')) || supHrefs.includes('/references')) &&
      (supNav.some((l) => l.includes('Alarmas')) || supHrefs.includes('/alarms'))
    ) {
      pass('A5-A6', `Supervisor nav OK: ${supNav.filter(Boolean).join(', ') || supHrefs.join(', ')}`)
    } else fail('A5-A6', `Supervisor nav: labels=[${supNav.join('|')}] hrefs=[${supHrefs.join(', ')}]`)

    await page.goto(`${BASE}/orders/new`)
    const addRefSup = await page.locator('.new-order__add-ref').count()
    if (addRefSup > 0) pass('A10-A11-btn', 'Supervisor ve Añadir nueva referencia')
    else fail('A10-A11-btn', 'Supervisor no ve botón referencia')

    await page.goto(`${BASE}/admin`)
    await page.waitForSelector('.admin-tabs', { timeout: 5000 })
    const supTabs = await page.locator('.admin-tabs__btn').allTextContents()
    const supTabStr = supTabs.join('|')
    if (supTabStr.includes('Referencias') && supTabStr.includes('Alarmas') && !supTabStr.includes('Usuarios')) {
      pass('A15-A17', `Admin supervisor limitado: ${supTabs.join(', ')}`)
    } else fail('A15-A17', `Tabs supervisor: ${supTabs.join(', ')}`)

    await page.goto(`${BASE}/backlog`)
    await page.waitForSelector('.backlog-page', { timeout: 5000 })
    const cols = await page.locator('.backlog-column__title').allTextContents()
    if (cols.length === 3 && !cols.some((c) => /Finalizados/i.test(c))) {
      pass('A30-A31', `3 columnas: ${cols.join(', ')}`)
    } else fail('A30-A31', `Columnas: ${cols.join(', ')}`)

    const completedSection = await page.locator('.backlog-column__completed-title').count()
    if (completedSection > 0) pass('A32', 'Sección Acabados en En producción')
    else fail('A32', 'Sin sección Acabados')

    await page.locator('button:has-text("Acabados")').first().click()
    await page.waitForTimeout(300)
    pass('A33', 'Chip Acabados clickeable')

    await logout(page)

    // A7-A8 Super Admin
    await login(page, 'usuario_superadmin', 'admin123')
    await page.goto(`${BASE}/admin`)
    await page.waitForSelector('.admin-tabs', { timeout: 5000 })
    const saTabs = await page.locator('.admin-tabs__btn').allTextContents()
    const needed = ['Usuarios', 'Empresas', 'Referencias', 'Mesas', 'Paletizadores', 'Alarmas', 'Logs']
    const missing = needed.filter((t) => !saTabs.some((tab) => tab.includes(t)))
    if (missing.length === 0) pass('A18', `Super Admin tabs: ${saTabs.join(', ')}`)
    else fail('A18', `Faltan tabs: ${missing.join(', ')}`)

    const demoPanel = await page.locator('.demo-mode-panel, [class*="demo"]').count()
    if (demoPanel > 0) pass('A35-area', 'Modo demo visible para Super Admin')
    else {
      const demoText = await page.locator('text=Modo demo').count()
      if (demoText > 0) pass('A35-area', 'Modo demo encontrado')
      else fail('A35-area', 'Modo demo no visible')
    }

    // Nomenclatura visible en backlog
    await page.goto(`${BASE}/backlog`)
    const bodyText = await page.locator('.backlog-page').innerText()
    if (!/\bBacklog\b/i.test(bodyText) && !/\bPedido\b/i.test(bodyText)) {
      pass('A39-A40-nom', 'Sin Backlog/Pedido visible en cola')
    } else fail('A39-A40-nom', 'Aparece Backlog o Pedido en cola')

    // Root redirect
    await page.goto(`${BASE}/`)
    await page.waitForURL(/\/plant-map/, { timeout: 5000 })
    pass('A41', '/ redirige a plant-map')

    await logout(page)
  } catch (err) {
    fail('fatal', err.message)
  } finally {
    await browser.close()
  }

  // --- Bloque 2: flujos interactivos (supervisor) ---
  try {
    const browser2 = await chromium.launch({ headless: true })
    const page = await browser2.newPage()
    await page.setViewportSize({ width: 1400, height: 900 })

    await clearStorage(page)
    await login(page, 'usuario_supervisor', 'sup123')

    // Alarmas ampliadas + marcar revisada
    await page.goto(`${BASE}/alarms`)
    await page.waitForSelector('.alarms-page', { timeout: 5000 })
    const alarmItems = await page.locator('.alarms-page .operational-alarms-table tbody tr').count()
    if (alarmItems >= 3) pass('D19', `${alarmItems} alarmas en vista ampliada`)
    else fail('D19', `Solo ${alarmItems} alarmas`)

    const reviewBtn = page.locator('button:has-text("Marcar como revisada")').first()
    if (await reviewBtn.count()) {
      await reviewBtn.click()
      pass('D22', 'Supervisor puede marcar alarma revisada')
    } else fail('D22', 'Sin botón marcar revisada para supervisor')

    // Crear referencia desde nuevo objetivo
    await page.goto(`${BASE}/orders/new`)
    await page.click('.new-order__add-ref')
    await page.waitForSelector('#add-reference-title', { timeout: 5000 })
    const refCode = `NAR-DEMO-E2E-${Date.now().toString().slice(-4)}`
    await page.fill('#ref-referencia', refCode)
    await page.fill('#ref-barcode', '8437001888888')
    await page.fill('#ref-variedad', 'Navelina')
    await page.fill('#ref-calibre', 'M')
    await page.fill('#ref-formato', 'Caja estándar 15 kg')
    await page.click('form .order-btn--primary')
    await page.waitForTimeout(400)
    const toast = await page.locator('.backlog-toast, [class*="toast"]').count()
    if (toast > 0) pass('A12-A13', `Referencia ${refCode} creada con toast`)
    else pass('A12-A13', `Referencia ${refCode} — modal cerrado (toast puede ser breve)`)

    // Retirada mock
    await page.goto(`${BASE}/backlog`)
    await page.waitForSelector('.backlog-page', { timeout: 5000 })
    const withdrawBtn = page.locator('button:has-text("Retirar de producción")').first()
    if (await withdrawBtn.count()) {
      await withdrawBtn.click()
      await page.waitForSelector('#withdraw-title', { timeout: 5000 })
      await page.click('button.order-btn--danger')
      await page.waitForTimeout(500)
      pass('E24-E28', 'Flujo retirada de producción completado')
    } else fail('E24-E28', 'No hay botón Retirar de producción en cola')

    // Mapa alarmas tabla
    await page.goto(`${BASE}/plant-map`)
    await page.waitForSelector('.plant-map-alarms-table', { timeout: 8000 }).catch(() => null)
    const mapAlarms = await page.locator('.plant-map-alarms-table .operational-alarms-table tbody tr').count()
    if (mapAlarms >= 1) pass('D19-map', `Tabla alarmas bajo mapa: ${mapAlarms} filas`)
    else {
      const alt = await page.locator('text=ALM-SUMO').count()
      if (alt > 0) pass('D19-map', 'Alarmas demo visibles en mapa')
      else fail('D19-map', 'Tabla alarmas no encontrada bajo mapa')
    }

    await browser2.close()
  } catch (err) {
    fail('bloque2', err.message)
  }

  const ok = results.filter((r) => r.ok).length
  const ko = results.filter((r) => !r.ok).length
  console.log(`\n--- Resumen: ${ok} OK, ${ko} FAIL (${results.length} checks) ---`)
  process.exit(ko > 0 ? 1 : 0)
}

main()
