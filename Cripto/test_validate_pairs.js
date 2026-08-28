/**
 * CryptoMaster - Teste de Validação de Pares
 *
 * Testa a lógica de validação de pares contra a API da Binance:
 * 1. Validação inicial remove pares inválidos
 * 2. Cache de 24h funciona corretamente
 * 3. revalidatePairs() limpa cache e re-valida
 * 4. Indicador de status é atualizado
 * 5. Pares inválidos são detectados corretamente
 */

const puppeteer = require('puppeteer-core');

const URL = 'http://localhost:9393/Consolidated.html';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('='.repeat(60));
  console.log('  🔍 TESTE — VALIDAÇÃO DE PARES');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  let passed = 0;
  let failed = 0;

  function assert(condition, msg) {
    if (condition) { passed++; console.log(`  ✅ ${msg}`); }
    else { failed++; console.log(`  ❌ ${msg}`); }
  }

  try {
    // ============================================
    // TESTE 1: Validação remove pares inválidos
    // ============================================
    console.log('\n📡 TESTE 1: Validação remove pares inválidos');
    console.log('-'.repeat(50));

    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
    // Wait for validation to complete by polling the status indicator
    await page.waitForFunction(() => {
      const el = document.getElementById('pairValidationStatus');
      return el && (el.textContent.includes('válidos') || el.textContent.includes('removidos'));
    }, { timeout: 60000 });

    const result1 = await page.evaluate(() => {
      const pairs = CONFIG.preferredPairs;
      const invalidKnown = ['KASUSDT','CQtUSDT','BOBAUSDT','SCROLLUSDT','HEROUSDT',
        'STEPUSDT','AKTUSDT','RSS3USDT','MPLUSDT','TOKENUSDT','CPOOLUSDT',
        'TUKUSDT','MNATUSDT','ELONUSDT','MOGUSDT','POPCATUSDT','BRETTUSDT'];
      const found = invalidKnown.filter(p => pairs.includes(p));
      return { total: pairs.length, invalidFound: found };
    });

    assert(result1.total > 50, `Lista tem ${result1.total} pares (esperado > 50)`);
    assert(result1.invalidFound.length === 0,
      result1.invalidFound.length === 0
        ? 'Nenhum par inválido conhecido encontrado'
        : `Pares inválidos ainda presentes: ${result1.invalidFound.join(', ')}`);

    // ============================================
    // TESTE 2: Indicador de status é atualizado
    // ============================================
    console.log('\n📡 TESTE 2: Indicador de status');
    console.log('-'.repeat(50));

    const result2 = await page.evaluate(() => {
      const el = document.getElementById('pairValidationStatus');
      return { exists: !!el, text: el?.textContent?.trim() || '', hasValidated: el?.textContent?.includes('válidos') };
    });

    assert(result2.exists, 'Elemento pairValidationStatus existe');
    assert(result2.hasValidated, `Indicador mostra status validado: "${result2.text}"`);

    // ============================================
    // TESTE 3: Cache funciona (2ª carga é instantânea)
    // ============================================
    console.log('\n📡 TESTE 3: Cache de validação');
    console.log('-'.repeat(50));

    const result3 = await page.evaluate(() => {
      const cache = JSON.parse(localStorage.getItem('cryptomaster_validated_pairs') || 'null');
      return {
        cached: !!cache,
        hasTimestamp: !!(cache && cache.ts),
        hasValid: !!(cache && cache.valid),
        validCount: cache?.valid?.length || 0,
        age: cache?.ts ? Math.round((Date.now() - cache.ts) / 1000) : null
      };
    });

    assert(result3.cached, 'Cache de validação existe no localStorage');
    assert(result3.hasTimestamp, 'Cache tem timestamp');
    assert(result3.validCount > 50, `Cache tem ${result3.validCount} pares válidos`);
    assert(result3.age !== null && result3.age < 60, `Cache tem ${result3.age}s (recente)`);

    // Reload and check it's fast (from cache)
    const t0 = Date.now();
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForFunction(() => {
      const el = document.getElementById('pairValidationStatus');
      return el && (el.textContent.includes('válidos') || el.textContent.includes('removidos'));
    }, { timeout: 10000 });
    const reloadTime = Date.now() - t0;

    const result3b = await page.evaluate(() => {
      const el = document.getElementById('pairValidationStatus');
      return { text: el?.textContent?.trim() || '', hasValidated: el?.textContent?.includes('válidos') };
    });

    assert(result3b.hasValidated, `Após reload, indicador já mostra validado (cache hit, ${reloadTime}ms)`);

    // ============================================
    // TESTE 4: revalidatePairs() limpa cache
    // ============================================
    console.log('\n📡 TESTE 4: Botão re-validate');
    console.log('-'.repeat(50));

    const result4 = await page.evaluate(async () => {
      // Check button exists
      const btn = document.getElementById('btnRevalidate');
      if (!btn) return { buttonExists: false };

      // Click it
      btn.click();
      // Wait for validation to finish by polling
      await new Promise(resolve => {
        const check = setInterval(() => {
          const el = document.getElementById('pairValidationStatus');
          if (el && (el.textContent.includes('válidos') || el.textContent.includes('removidos'))) {
            clearInterval(check);
            resolve();
          }
        }, 500);
        setTimeout(() => { clearInterval(check); resolve(); }, 30000);
      });

      const statusEl = document.getElementById('pairValidationStatus');
      const cache = JSON.parse(localStorage.getItem('cryptomaster_validated_pairs') || 'null');
      return {
        buttonExists: true,
        statusText: statusEl?.textContent?.trim() || '',
        cacheAfter: !!cache,
        pairsCount: CONFIG.preferredPairs.length
      };
    });

    assert(result4.buttonExists, 'Botão re-validate existe');
    assert(result4.cacheAfter, 'Cache recriado após re-validate');
    assert(result4.pairsCount > 50, `Pares restaurados: ${result4.pairsCount}`);
    assert(result4.statusText.includes('válidos'), `Status atualizado: "${result4.statusText}"`);

    // ============================================
    // TESTE 5: fetchKlines retorna [] em par inválido
    // ============================================
    console.log('\n📡 TESTE 5: fetchKlines gracefully handle par inválido');
    console.log('-'.repeat(50));

    const result5 = await page.evaluate(async () => {
      // KASUSDT should return empty array, not throw
      try {
        const klines = await fetchKlines('KASUSDTINVALID', '1h', 1);
        return { threw: false, isArray: Array.isArray(klines), length: klines?.length || 0 };
      } catch(e) {
        return { threw: true, error: e.message };
      }
    });

    assert(!result5.threw, `fetchKlines não lança exceção para par inválido (${result5.threw ? result5.error : 'ok'})`);
    assert(result5.isArray, `fetchKlines retorna array (${result5.isArray})`);
    assert(result5.length === 0, `fetchKlines retorna array vazio para par inválido (length=${result5.length})`);

    // ============================================
    // TESTE 6: Todos os pares da lista são válidos
    // ============================================
    console.log('\n📡 TESTE 6: Verificação batch de todos os pares');
    console.log('-'.repeat(50));

    const result6 = await page.evaluate(async () => {
      const pairs = CONFIG.preferredPairs;
      const BATCH = 10;
      const invalid = [];
      let checked = 0;
      for (let i = 0; i < pairs.length; i += BATCH) {
        const batch = pairs.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(async (sym) => {
          try {
            const r = await fetchWithTimeout(`/proxy/binance/api/v3/klines?symbol=${sym}&interval=1h&limit=1`);
            return { sym, ok: r.ok };
          } catch(e) { return { sym, ok: false }; }
        }));
        results.forEach(r => { if (!r.ok) invalid.push(r.sym); });
        checked += batch.length;
      }
      return { total: pairs.length, checked, invalid };
    });

    assert(result6.checked === result6.total, `Todos os ${result6.total} pares foram verificados`);
    assert(result6.invalid.length === 0,
      result6.invalid.length === 0
        ? 'Todos os pares retornam 200'
        : `Pares inválidos: ${result6.invalid.join(', ')}`);

    // ============================================
    // TESTE 7: SECTOR_MAP não contém pares removidos
    // ============================================
    console.log('\n📡 TESTE 7: SECTOR_MAP consistente');
    console.log('-'.repeat(50));

    const result7 = await page.evaluate(() => {
      const invalidInSector = ['KASUSDT','CQtUSDT','BOBAUSDT','SCROLLUSDT','HEROUSDT',
        'STEPUSDT','AKTUSDT','RSS3USDT','MPLUSDT','TOKENUSDT','CPOOLUSDT',
        'TUKUSDT','MNATUSDT','ELONUSDT','MOGUSDT','POPCATUSDT','BRETTUSDT'];
      const found = invalidInSector.filter(p => SECTOR_MAP[p]);
      return { invalidInSectorMap: found };
    });

    assert(result7.invalidInSectorMap.length === 0,
      result7.invalidInSectorMap.length === 0
        ? 'SECTOR_MAP limpo de pares inválidos'
        : `SECTOR_MAP ainda contém: ${result7.invalidInSectorMap.join(', ')}`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log(`  📊 RESULTADO: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60));

  } catch(e) {
    console.error('\n❌ Erro geral:', e.message);
    failed++;
  } finally {
    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
