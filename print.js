// ═══════════════════════════════════════════════════════════════════
//  print.html — Module d'impression La Lysardière
//  Utilisé par : transport.html, formulaire.html, documents.html
//
//  Usage depuis n'importe quel fichier :
//    openPrintWindow(html, { title: '...', autoPrint: true })
//
//  Ou avec les helpers :
//    LysPrint.courrier(courrierData, singleKey)
//    LysPrint.dossier(formData, mode)
// ═══════════════════════════════════════════════════════════════════

// ── CSS A4 de référence ──────────────────────────────────────────
const LYS_PRINT_CSS = `
  /* Reset */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* Page A4 — marges gérées par le body padding dans openPrintWindow */

  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    color: #111;
    background: white;
    line-height: 1.4;
  }

  /* ── PAGE BREAKS ── */
  .lp-page {
    page-break-after: always;
    break-after: page;
    padding: 0;
  }
  .lp-page:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* Avoid breaking inside these */
  .lp-card, .lp-field-group, .lp-yn-row, table, tr,
  .lp-section-hdr, .lp-sig, .lp-alert, .lp-dest {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* ── HEADER La Lysardière ── */
  .lp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 6pt;
    border-bottom: 2pt solid #1a5c4e;
    margin-bottom: 10pt;
  }
  .lp-logo {
    font-family: Georgia, serif;
    font-size: 18pt;
    font-weight: 700;
    color: #1a5c4e;
    line-height: 1;
  }
  .lp-logo-sub {
    font-family: Arial, sans-serif;
    font-size: 7pt;
    color: #666;
    font-weight: normal;
    margin-top: 3pt;
    line-height: 1.4;
  }
  .lp-page-title {
    text-align: right;
    font-family: Georgia, serif;
    font-size: 11pt;
    color: #1a5c4e;
    font-weight: 700;
  }
  .lp-page-subtitle {
    font-family: Arial, sans-serif;
    font-size: 8pt;
    color: #666;
    font-weight: normal;
    margin-top: 2pt;
  }

  /* ── SECTION BARS ── */
  .lp-section-hdr {
    color: white;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8pt;
    padding: 3pt 8pt;
    margin: 8pt 0 5pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .lp-section-green  { background: #1a5c4e; }
  .lp-section-orange { background: #d35400; }
  .lp-section-red    { background: #c0392b; }
  .lp-section-grey   { background: #4a4a4a; }

  /* ── FIELDS ── */
  .lp-row2  { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; margin-bottom: 4pt; }
  .lp-row3  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8pt; margin-bottom: 4pt; }
  .lp-field { margin-bottom: 4pt; }
  .lp-label {
    font-size: 7pt;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.3pt;
    margin-bottom: 1pt;
  }
  .lp-value {
    font-size: 9.5pt;
    color: #111;
    border-bottom: 0.75pt solid #bbb;
    padding-bottom: 2pt;
    min-height: 13pt;
  }

  /* ── OUI / NON ── */
  .lp-yn {
    display: flex;
    align-items: center;
    gap: 6pt;
    margin-bottom: 3pt;
    font-size: 9pt;
  }
  .lp-yn-label { flex: 1; }
  .lp-yn-box {
    display: inline-flex;
    align-items: center;
    gap: 2pt;
    font-size: 9pt;
  }
  .lp-yn-box.checked { font-weight: 700; color: #1a5c4e; }
  .lp-yn-inline-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 3pt 0;
    margin-bottom: 5pt;
  }
  .lp-yn-inline {
    display: inline-flex;
    align-items: center;
    gap: 4pt;
    margin-right: 14pt;
    font-size: 9pt;
    white-space: nowrap;
  }

  /* ── CHECKBOXES multiples ── */
  .lp-chk-row {
    display: flex;
    align-items: center;
    gap: 6pt;
    margin-bottom: 3pt;
    font-size: 9pt;
  }
  .lp-chk-label { color: #888; font-size: 7pt; text-transform: uppercase; }
  .lp-chk-box { display: inline-flex; align-items: center; gap: 2pt; }
  .lp-chk-box.checked { font-weight: 700; color: #1a5c4e; }

  /* ── TEXTAREA ── */
  .lp-ta {
    margin-bottom: 5pt;
  }
  .lp-ta-value {
    border: 0.75pt solid #ddd;
    padding: 4pt 6pt;
    min-height: 22pt;
    font-size: 9.5pt;
    line-height: 1.5;
    background: #fafafa;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── GRILLE HYGIÈNE / ALIM ── */
  .lp-grille {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 6pt;
    font-size: 8.5pt;
  }
  .lp-grille th {
    padding: 3pt 4pt;
    text-align: center;
    font-size: 8pt;
    font-weight: 600;
    border: 0.75pt solid #999;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .lp-grille th.lp-act { text-align: left; background: #1a5c4e; color: white; }
  .lp-grille th:not(.lp-act) { background: #1a5c4e; color: white; width: 55pt; }
  .lp-grille td { border: 0.75pt solid #ddd; padding: 2pt 4pt; text-align: center; font-size: 9.5pt; }
  .lp-grille td.lp-act { text-align: left; font-size: 9pt; }
  .lp-grille tr.lp-sub td.lp-act { padding-left: 12pt; color: #555; font-style: italic; }

  /* ── TROUBLES (2 colonnes) ── */
  .lp-troubles { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; margin-bottom: 5pt; }
  .lp-troubles-col { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  .lp-troubles-col th { background: #f0f0f0; padding: 2pt 5pt; text-align: left; border: 0.75pt solid #ddd; font-size: 8pt; }
  .lp-troubles-col td { padding: 2pt 5pt; border: 0.75pt solid #eee; }
  .lp-troubles-col td.lp-chk { text-align: center; width: 22pt; }
  .lp-troubles-col td.lp-prec { color: #555; font-size: 7.5pt; }

  /* ── SIGNATURE ── */
  .lp-sig {
    margin-top: 10pt;
    border-top: 0.75pt solid #ddd;
    padding-top: 8pt;
  }
  .lp-sig-line {
    margin-top: 16pt;
    border-bottom: 0.75pt solid #bbb;
    padding-bottom: 2pt;
    font-size: 7pt;
    color: #888;
  }

  /* ── ALERT BOX ── */
  .lp-alert {
    border: 0.75pt solid #f0c040;
    background: #fffbea;
    padding: 5pt 8pt;
    font-size: 8.5pt;
    color: #7a5800;
    margin-bottom: 7pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .lp-alert-red {
    border-color: #f8baba;
    background: #fff0f0;
    color: #9b2020;
  }

  /* ── DESTINATAIRE (courrier) ── */
  .lp-dest {
    border: 0.75pt solid #ddd;
    padding: 7pt 10pt;
    margin-bottom: 10pt;
    font-size: 9pt;
    line-height: 1.6;
  }
  .lp-dest strong { color: #1a5c4e; }

  /* ── COURRIER ── */
  .lp-rdv-box {
    border: 2.5pt solid #111;
    border-radius: 4pt;
    padding: 12pt 18pt;
    margin: 16pt auto 22pt;
    max-width: 420pt;
    background: #f8f8f8;
    text-align: center;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .lp-rdv-multi {
    display: flex;
    border-top: 0.75pt solid #ccc;
    margin-top: 6pt;
  }
  .lp-rdv-col {
    flex: 1;
    padding: 8pt 12pt;
    text-align: center;
  }
  .lp-rdv-col + .lp-rdv-col { border-left: 1.5pt solid #ccc; }
  .lp-trajet-card {
    border: 0.75pt solid #ccc;
    border-radius: 3pt;
    padding: 10pt 14pt;
    margin-bottom: 8pt;
    break-inside: avoid;
  }
  .lp-footer {
    margin-top: 12pt;
    padding-top: 8pt;
    border-top: 0.75pt solid #ddd;
    font-size: 7.5pt;
    color: #999;
    text-align: center;
  }

  /* ── PRINT ONLY ── */
  .no-print { display: none !important; }
`;

// ── Utilitaires ─────────────────────────────────────────────────
const LysPrint = {};

LysPrint._v = v => (v || '').toString().trim() || '—';
LysPrint._yn = v => v === 'oui' ? 'Oui' : v === 'non' ? 'Non' : v || '—';

LysPrint._field = (label, value) => `
  <div class="lp-field">
    <div class="lp-label">${label}</div>
    <div class="lp-value">${LysPrint._v(value)}</div>
  </div>`;

LysPrint._row2 = (l1,v1,l2,v2) => `
  <div class="lp-row2">
    ${LysPrint._field(l1,v1)}
    ${LysPrint._field(l2,v2)}
  </div>`;

LysPrint._row3 = (l1,v1,l2,v2,l3,v3) => `
  <div class="lp-row3">
    ${LysPrint._field(l1,v1)}
    ${LysPrint._field(l2,v2)}
    ${LysPrint._field(l3,v3)}
  </div>`;

LysPrint._sec = (title, color='green') => `
  <div class="lp-section-hdr lp-section-${color}">${title}</div>`;

LysPrint._ta = (label, value) => `
  <div class="lp-ta">
    <div class="lp-label">${label}</div>
    <div class="lp-ta-value">${(value||'—').replace(/\n/g,'<br>')}</div>
  </div>`;

LysPrint._yn = (label, v, inline=false) => {
  const isOui = v === 'oui', isNon = v === 'non';
  if(inline) return `
    <div class="lp-yn-inline">
      <span>${label}</span>
      <span class="lp-yn-box${isOui?' checked':''}">${isOui?'☑':'☐'} Oui</span>
      <span class="lp-yn-box${isNon?' checked':''}">${isNon?'☑':'☐'} Non</span>
    </div>`;
  return `
    <div class="lp-yn">
      <span class="lp-yn-label">${label}</span>
      <span class="lp-yn-box${isOui?' checked':''}">${isOui?'☑':'☐'} Oui</span>
      <span class="lp-yn-box${isNon?' checked':''}">${isNon?'☑':'☐'} Non</span>
    </div>`;
};

LysPrint._chk = (label, options, values) => {
  const boxes = options.map(([k,lbl]) => {
    const checked = values && (typeof values === 'object' ? values[k] : values === k);
    return `<span class="lp-chk-box${checked?' checked':''}">${checked?'☑':'☐'} ${lbl}</span>`;
  }).join(' ');
  return `<div class="lp-chk-row"><span class="lp-chk-label">${label} :</span>${boxes}</div>`;
};

LysPrint._header = (title, subtitle='') => `
  <div class="lp-header">
    <div>
      <div class="lp-logo">La Lysardière
        <div class="lp-logo-sub">84 Route de Sainte Mondane — 24370 Saint Julien de Lampon<br>
        05 53 30 57 15 / 06 03 88 15 13 — Siret : 79926743000012 — N° Atout France : IM024140012</div>
      </div>
    </div>
    <div class="lp-page-title">${title}${subtitle?`<div class="lp-page-subtitle">${subtitle}</div>`:''}</div>
  </div>`;

LysPrint._grille = (title, items, tableData) => {
  const COLS = ['Seul(e)', 'Stimulation verbale', 'Aide partielle', 'Aide totale'];
  const KEYS = ['seul', 'stim', 'aide_partielle', 'aide_totale'];
  const rows = items.map(item => {
    const r = (tableData || {})[item.label] || {};
    return `<tr class="${item.sub?'lp-sub':''}">
      <td class="lp-act">${item.sub ? '&nbsp;&nbsp;&nbsp;' + item.label : item.label}</td>
      ${KEYS.map(k => `<td>${r[k]?'☑':'☐'}</td>`).join('')}
    </tr>`;
  }).join('');
  return `
    <table class="lp-grille">
      <thead><tr>
        <th class="lp-act">${title}</th>
        ${COLS.map(c => `<th>${c}</th>`).join('')}
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
};

LysPrint._troubles = (liste) => {
  const MAP = {
    objet_personnel:'Objet personnel', rituels:'Rituels', potomanie:'Potomanie',
    peur_foule:'Peur de la foule', crise_angoisse:'Crise d\'angoisse', isole:'S\'isole',
    fabulations:'Fabulations, délires', trouble_memoire:'Trouble de la mémoire',
    autres:'Autres (précisez)', mise_danger_soi:'Mise en danger de soi',
    automutilation:'Automutilation', tendance_fugue:'Tendance à fuguer',
    tentative_suicide:'Tentative de suicide', exhibitionnisme:'Trouble exhibitionniste',
    troubles_sexuels:'Troubles sexuels'
  };
  const entries = Object.entries(liste || {});
  const half = Math.ceil(entries.length / 2);
  const makeCol = arr => `
    <table class="lp-troubles-col">
      <thead><tr><th>Trouble</th><th style="width:22pt">Oui</th><th style="width:22pt">Non</th><th>Précision</th></tr></thead>
      <tbody>${arr.map(([k,v]) => `
        <tr>
          <td>${MAP[k]||k}</td>
          <td class="lp-chk">${v?.valeur==='oui'?'☑':'☐'}</td>
          <td class="lp-chk">${v?.valeur==='non'?'☑':'☐'}</td>
          <td class="lp-prec">${v?.valeur==='oui'&&v?.detail?v.detail:'—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  return `<div class="lp-troubles">${makeCol(entries.slice(0,half))}${makeCol(entries.slice(half))}</div>`;
};

LysPrint._chkFmt = obj => {
  if(!obj) return 'Non';
  if(typeof obj === 'string') return obj;
  const map = {matin:'Matin',midi:'Midi',soir:'Soir',non:'Aucune',jour:'Jour',nuit:'Nuit'};
  return Object.entries(obj).filter(([,v])=>v).map(([k])=>map[k]||k).join(', ') || 'Non';
};

// ── TEMPLATE : COURRIER ─────────────────────────────────────────
LysPrint.buildCourrierPage = function(c, key) {
  const foyer = c.foyer || '';
  const pKeys = Object.keys(c.personnes || {}).sort();
  const today = new Date().toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric'});

  // Lieux uniques
  const seenNoms = {};
  const uniqueLieux = [];
  pKeys.forEach(pk => {
    const l = c.personnes[pk].lieu;
    if(l && l.nom && !seenNoms[l.nom]) { seenNoms[l.nom]=true; uniqueLieux.push(l); }
  });
  const singleLieu = uniqueLieux.length <= 1 ? uniqueLieux[0]||null : null;

  // Groupes séjour
  const sejourGroups = {};
  pKeys.forEach(pk => {
    const pers = c.personnes[pk];
    const sorted = (pers.trajets||[]).slice().sort((a,b)=>{
      const dc=(a.date||'').localeCompare(b.date||'');
      if(dc!==0) return dc;
      if(a.type==='arrivee'&&b.type==='depart') return -1;
      if(a.type==='depart'&&b.type==='arrivee') return 1;
      return 0;
    });
    let i=0;
    while(i<sorted.length){
      const t=sorted[i];
      let pair;
      if(t.type==='arrivee'){
        const next=sorted[i+1]&&sorted[i+1].type==='depart'?sorted[i+1]:null;
        pair={arr:t,dep:next}; i+=next?2:1;
      } else { pair={arr:null,dep:t}; i++; }
      const gk=(pair.arr?pair.arr.date+'_'+(pair.arr.heure||''):'X')+'|'+(pair.dep?pair.dep.date+'_'+(pair.dep.heure||''):'X');
      if(!sejourGroups[gk]) sejourGroups[gk]={arr:pair.arr,dep:pair.dep,noms:[],lieux:[]};
      sejourGroups[gk].noms.push((pers.prenom||'')+' '+((pers.nom||'').toUpperCase()));
      sejourGroups[gk].lieux.push(pers.lieu||null);
    }
  });

  const fmtD = d => { try { return new Date(d+'T12:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); } catch(e){return d;} };

  const trajetsHtml = Object.keys(sejourGroups).sort().map(gk => {
    const g = sejourGroups[gk];
    const nomsStr = singleLieu
      ? g.noms.join(', ')
      : g.noms.map((n,i) => { const l=g.lieux[i]; return n+(l&&l.nom?` <span style="font-size:9pt;color:#555">(${l.nom})</span>`:''); }).join(', ');
    const dateRange = g.arr&&g.dep ? `Du ${g.arr.date} au ${g.dep.date}` : g.arr ? `Arrivée ${g.arr.date}` : `Départ ${g.dep.date}`;
    return `
      <div class="lp-trajet-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7pt">
          <strong style="font-size:11pt">${nomsStr}</strong>
          <span style="font-size:9pt;color:#666;white-space:nowrap;margin-left:12pt">${dateRange}</span>
        </div>
        <div style="display:flex;gap:32pt">
          ${g.arr?`<div>
            <div style="font-size:7pt;text-transform:uppercase;letter-spacing:1pt;color:#888;margin-bottom:2pt">ALLER</div>
            <div style="font-size:9pt;color:#444">le ${fmtD(g.arr.date)}</div>
            <div style="font-size:18pt;font-weight:bold;line-height:1.1">${g.arr.heure}</div>
          </div>`:''}
          ${g.dep?`<div>
            <div style="font-size:7pt;text-transform:uppercase;letter-spacing:1pt;color:#888;margin-bottom:2pt">RETOUR</div>
            <div style="font-size:9pt;color:#444">le ${fmtD(g.dep.date)}</div>
            <div style="font-size:18pt;font-weight:bold;line-height:1.1">${g.dep.heure}</div>
          </div>`:''}
        </div>
      </div>`;
  }).join('');

  const rdvHtml = singleLieu
    ? `<div class="lp-rdv-box">
        <div style="font-size:8pt;text-transform:uppercase;letter-spacing:1.5pt;color:#666;margin-bottom:4pt">Lieu de rendez-vous Aller / Retour</div>
        <div style="font-size:14pt;font-weight:bold">${singleLieu.nom}</div>
        ${singleLieu.adresse?`<div style="font-size:9pt;color:#444;margin-top:3pt">${singleLieu.adresse}</div>`:''}
      </div>`
    : `<div class="lp-rdv-box">
        <div style="font-size:8pt;text-transform:uppercase;letter-spacing:1.5pt;color:#666;margin-bottom:4pt">Lieux de rendez-vous Aller / Retour</div>
        <div class="lp-rdv-multi">
          ${uniqueLieux.map((l,i) => `
            <div class="lp-rdv-col${i>0?' lp-rdv-col':''}" style="${i>0?'border-left:1.5pt solid #ccc':''}">
              <div style="font-size:13pt;font-weight:bold">${l.nom}</div>
              ${l.adresse?`<div style="font-size:9pt;color:#444;margin-top:3pt">${l.adresse}</div>`:''}
            </div>`).join('')}
        </div>
      </div>`;

  return `
    <div class="lp-page">
      <div class="lp-header">
        <div>
          <div class="lp-logo">La Lysardière
            <div class="lp-logo-sub">84 Route de Sainte Mondane — 24370 Saint Julien de Lampon<br>
            05 53 30 57 15 / 06 03 88 15 13<br>
            Siret : 79926743000012 — N° Atout France : IM024140012</div>
          </div>
        </div>
        <div style="text-align:right;font-size:8pt;color:#666">${today}</div>
      </div>

      <div class="lp-dest">
        <strong>Destinataire : ${foyer}</strong>
      </div>

      <p style="font-size:11pt;margin-bottom:6pt">Madame, Monsieur,</p>
      <p style="font-size:11pt;margin-bottom:14pt">Suite à l'inscription d'une ou plusieurs personnes aux séjours de vacances organisés par la Lysardière, voici le lieu et les horaires de rendez-vous aller/retour :</p>

      ${rdvHtml}
      ${trajetsHtml}

      <div class="lp-alert lp-alert-red" style="margin-top:14pt">
        <strong>IMPORTANT :</strong> Merci de fournir un <strong>pique-nique à l'ALLER</strong> si le rendez-vous est avant 12h45, et d'y ajouter les <strong>médicaments du midi</strong> (s'il y a).
      </div>

      <div style="margin-top:24pt;padding-top:12pt;border-top:1.5pt solid #ccc;font-size:11pt;line-height:2">
        Veuillez bien noter l'heure du rendez-vous et à être ponctuel afin de ne pas perturber l'organisation et le confort des vacanciers.
        <br><br>Nous vous prions de croire, Madame, Monsieur, à l'expression de nos meilleures salutations.
        <br><br><strong style="font-size:13pt">Séverine LANDELLE</strong>
      </div>
    </div>`;
};

// ── TEMPLATE : DOSSIER FORMULAIRE ──────────────────────────────
LysPrint.buildDossier = function(data, mode) {
  mode = mode || 'complet';
  const V = LysPrint._v, YN = LysPrint._yn, SEC = LysPrint._sec;
  const F = LysPrint._field, R2 = LysPrint._row2, R3 = LysPrint._row3;
  const TA = LysPrint._ta, CHK = LysPrint._chk, GR = LysPrint._grille;
  const HDR = LysPrint._header;

  const insc = data.inscription || {}, conf = data.confidentielle || {};
  const p = insc.participant || {}, resp = insc.responsable || {}, rf = insc.releve_frais || {};
  const id = conf.identite || {}, mob = conf.mobilite || {}, hyg = conf.hygiene || {};
  const alim = conf.alimentation || {}, rep = conf.repos || {}, comm = conf.communication || {};
  const rel = conf.relation || {}, dep = conf.deplacements || {}, sort = conf.sorties || {};
  const act = conf.activites || {}, trou = conf.troubles || {}, hab = conf.habitudes || {};
  const sante = conf.sante || {}, astr = conf.astreinte || {};

  const typLabel = {
    weekend_theme:'Week-ends à thèmes', mini_sejour:'Les Mini Séjours',
    weekend_ordinaire:'Week-end et séjour ordinaire', sejour:'Fiche d\'inscription séjour'
  }[insc.type_sejour] || insc.type_sejour || '';

  const HYGIENE_ITEMS = [
    {label:'Fait sa toilette',sub:false},{label:'Prend sa douche',sub:false},
    {label:'Les cheveux',sub:true},{label:'Le dos',sub:true},
    {label:'Les parties intimes',sub:true},{label:'Les pieds',sub:true},
    {label:'Se rase',sub:false},{label:'Se coiffe',sub:false},
    {label:'Se brosse les dents',sub:false},{label:'S\'habille',sub:false},
    {label:'Reconnaît ses vêtements',sub:false},{label:'Se chausse',sub:false},
    {label:'Va aux toilettes',sub:false}
  ];
  const ALIM_ITEMS = [{label:'Mange',sub:false},{label:'Boit',sub:false}];

  let pages = '';

  // ── PAGE 1 : FICHE INSCRIPTION ──────────────────────────────
  if(mode !== 'confidentiel') {
    pages += `<div class="lp-page">
      ${HDR(typLabel, 'Fiche d\'inscription')}
      <div class="lp-dest">
        <strong>Destinataire : ${V(resp.foyer)}</strong><br>
        ${V(resp.prenom)} ${V(resp.nom)} — ${V(resp.fonction)}<br>
        ${V(resp.adresse)}, ${V(resp.cp)} ${V(resp.ville)}<br>
        ${V(resp.tel)} — ${V(resp.mail_secretariat)}
      </div>
      ${SEC('Participant')}
      ${R3('Nom',p.nom,'Prénom',p.prenom,'Date de naissance',p.naissance)}
      <div class="lp-row3">
        ${F('Sexe',p.sexe)}
        ${F('Autonomie',p.autonomie)}
        <div class="lp-field">
          <div class="lp-label">Inscription en couple</div>
          <div style="display:flex;gap:10pt;padding-top:2pt">
            <span class="lp-yn-box${p.couple==='oui'?' checked':''}">${p.couple==='oui'?'☑':'☐'} Oui</span>
            <span class="lp-yn-box${p.couple==='non'?' checked':''}">${p.couple==='non'?'☑':'☐'} Non</span>
          </div>
        </div>
      </div>
      ${R2('Numéro d\'astreinte',p.astreinte,'Convoyage',
        p.convoyage==='gare_souillac_sarlat'?'Gare de Souillac ou Sarlat':
        p.convoyage==='accompagne_structure'?'Accompagné par sa structure':
        insc.convoyage==='gare_souillac_sarlat'?'Gare de Souillac ou Sarlat':
        insc.convoyage==='accompagne_structure'?'Accompagné par sa structure':
        'Pris en charge par La Lysardière')}

      ${SEC('Personne s\'occupant de l\'inscription')}
      <p style="font-size:8pt;color:#666;font-style:italic;margin-bottom:5pt">Uniquement à cette adresse seront envoyés les informations et le dossier. Merci de renseigner ces éléments de façon claire et lisible.</p>
      ${R3('Nom',resp.nom,'Prénom',resp.prenom,'Fonction',resp.fonction)}
      ${R2('Nom du chef de service',resp.chef_service,'Nom du foyer',resp.foyer)}
      ${F('Adresse',resp.adresse)}
      ${R3('Code postal',resp.cp,'Ville',resp.ville,'Téléphone',resp.tel)}
      ${R2('Mail du secrétariat',resp.mail_secretariat,'Mail à l\'éducatif',resp.mail_educatif)}

      ${SEC('Relevé de frais')}
      ${R2('Nom organisme',rf.organisme,'Nom et prénom contact',rf.contact)}
      ${F('Adresse',rf.adresse)}
      ${R3('Code postal',rf.cp,'Ville',rf.ville,'Téléphone',rf.tel)}
      ${R2('Mail',rf.mail,'Mail comptabilité',rf.mail_compta)}

      ${SEC('Séjour')}
      ${R2('Séjour choisi',insc.sejour_choisi,'Type',typLabel)}

      <div class="lp-sig">
        ${R3('Fait à',insc.signature?.fait_a,'Le',insc.signature?.date,'Qualité du signataire',insc.signature?.qualite)}
        <div class="lp-sig-line">Signature :</div>
      </div>
    </div>`;
  }

  if(mode === 'inscription') return pages;

  // ── PAGE 2 : CONF P1 — Identité, mobilité, astreinte ────────
  pages += `<div class="lp-page">
    ${HDR('Fiche Confidentielle','Page 1 — Identité, mobilité, astreinte, personnalité')}
    ${SEC('Identité & mobilité')}
    ${R3('Nom',id.nom,'Prénom',id.prenom,'Âge',id.age)}
    ${R2('Séjour',id.sejour,'Autonomie',id.autonomie)}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Besoin d\'une infirmière',mob.infirmiere,true)}
      ${mob.infirmiere==='oui' ? CHK('Moments',[['matin','Matin'],['midi','Midi'],['soir','Soir']],mob.infirmiere_moments) : ''}
      ${LysPrint._yn('Inscription en couple',mob.couple,true)}
      ${mob.couple==='oui' ? LysPrint._yn('Même chambre',mob.meme_chambre,true) : ''}
      ${LysPrint._yn('Fauteuil roulant',mob.fauteuil,true)}
      ${LysPrint._yn('Déambulateur',mob.deambulateur,true)}
      ${LysPrint._yn('Monte les escaliers',mob.escaliers,true)}
    </div>
    ${SEC('Personne d\'astreinte')}
    ${F('Type', astr.type==='responsable_inscription'?'Responsable inscription':astr.type==='responsable_legal'?'Responsable légal':'Autre personne')}
    ${astr.type==='autre' ? R2('Nom complet',(astr.prenom||'')+' '+(astr.nom||''),'Téléphone / Mail',V(astr.tel)+' — '+V(astr.mail)) : ''}
    ${TA('Description de la personnalité',conf.personnalite)}
    ${TA('Vie quotidienne (recommandations médicales, toilettes, habitudes…)',conf.vie_quotidienne)}
    ${TA('Comportement (relation avec inconnus, encadrants, autres vacanciers…)',conf.comportement)}
  </div>`;

  // ── PAGE 3 : CONF P2 — Hygiène & Alimentation ───────────────
  pages += `<div class="lp-page">
    ${HDR('Fiche Confidentielle','Page 2 — Hygiène & alimentation')}
    ${SEC('Hygiène')}
    ${GR('Activité / toilette', HYGIENE_ITEMS, hyg.tableau)}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Présence physique lors de la douche',hyg.presence_douche,true)}
      ${LysPrint._yn('Timer lors de la douche',hyg.timer_douche,true)}
      ${LysPrint._yn('Gestion du linge',hyg.linge,true)}
      ${LysPrint._yn('Poche de stomie',hyg.stomie,true)}
      ${hyg.stomie==='oui' ? F('Aide stomie',hyg.stomie_aide) : ''}
      ${LysPrint._yn('Pistolet',hyg.pistolet,true)}
      ${hyg.pistolet==='oui' ? F('Aide pistolet',hyg.pistolet_aide) : ''}
    </div>
    ${TA('Informations complémentaires (toilette)',hyg.protocoles_toilette)}

    ${SEC('Énurésies & Encoprésie','orange')}
    <div class="lp-row2">
      <div>
        ${CHK('Énurésies',[['jour','Jour'],['nuit','Nuit'],['non','Non']],hyg.enurese)}
        ${(hyg.enurese?.jour||hyg.enurese?.nuit)?`
          ${F('Fréquence',hyg.enurese?.freq)}
          ${F('Type de change',hyg.enurese?.type)}
          ${LysPrint._yn('Aide pour se changer',hyg.enurese?.aide)}` : ''}
      </div>
      <div>
        ${CHK('Encoprésie',[['jour','Jour'],['nuit','Nuit'],['non','Non']],hyg.encopresie)}
        ${(hyg.encopresie?.jour||hyg.encopresie?.nuit)?`
          ${F('Fréquence',hyg.encopresie?.freq)}
          ${F('Type de change',hyg.encopresie?.type)}
          ${LysPrint._yn('Aide pour se changer',hyg.encopresie?.aide)}` : ''}
      </div>
    </div>

    ${SEC('Alimentation','orange')}
    ${GR('Activité / repas', ALIM_ITEMS, alim.tableau)}
    <div class="lp-yn-inline-wrap">
      ${F('Présentation aliments',alim.presentation)}
      ${LysPrint._yn('Couverts adaptés',alim.couverts,true)}
      ${alim.couverts==='oui' ? F('Lesquels',alim.couverts_detail) : ''}
      ${LysPrint._yn('Gélifiant',alim.gelifiant,true)}
      ${LysPrint._yn('Risque de fausses routes',alim.fausses_routes,true)}
    </div>
    ${R2('Régime alimentaire',alim.regime,'Allergies',alim.allergies)}
    ${R2('Addictions alimentaires',alim.addictions,'Troubles alimentaires',alim.troubles)}
    ${TA('Informations complémentaires (alimentation)',alim.info_comp)}
  </div>`;

  // ── PAGE 4 : CONF P3 — Rythme, communication, relation ──────
  pages += `<div class="lp-page">
    ${HDR('Fiche Confidentielle','Page 3 — Rythme, repos, communication, relation')}
    ${SEC('Rythme et Repos')}
    ${LysPrint._yn('Peurs / angoisses nocturnes',rep.peurs_nuit)}
    ${rep.peurs_nuit==='oui' ? F('Précision',rep.peurs_nuit_detail) : ''}
    ${LysPrint._yn('Se lève la nuit',rep.leve_nuit)}
    ${rep.leve_nuit==='oui' ? F('Raisons',rep.leve_nuit_detail) : ''}
    ${LysPrint._yn('Surveillance nocturne nécessaire',rep.surveillance_nuit)}
    ${rep.surveillance_nuit==='oui' ? F('Raisons',rep.surveillance_nuit_detail) : ''}
    ${R2('Heure habituelle du coucher',rep.heure_coucher,'Heure habituelle du lever',rep.heure_lever)}
    ${TA('Informations complémentaires (repos)',rep.info_comp)}

    ${SEC('Communication','orange')}
    ${R2('Compréhension',comm.comprehension,'Mode de communication',comm.mode)}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Peut exprimer ses besoins',comm.exprime_besoins,true)}
      ${LysPrint._yn('Tient une conversation fluide',comm.conversation,true)}
      ${F('Écrit',comm.ecrit)}
      ${F('Lit',comm.lit)}
      ${LysPrint._yn('Téléphone portable',comm.telephone,true)}
    </div>
    ${comm.telephone==='oui' ? F('Protocole téléphone',comm.telephone_protocole) : ''}
    ${TA('Informations complémentaires (communication)',comm.info_comp)}

    ${SEC('Relation','orange')}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Sociable',rel.sociable,true)}
      ${LysPrint._yn('S\'isole',rel.isole,true)}
      ${LysPrint._yn('Agressivité verbale',rel.agressivite_verbale,true)}
      ${LysPrint._yn('Agressivité physique',rel.agressivite_physique,true)}
    </div>
    ${rel.agressivite_physique==='oui' ? R2('Envers qui',rel.agressivite_detail,'Préconisations',rel.agressivite_preconisation) : ''}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Partage la même chambre',rel.meme_chambre,true)}
      ${LysPrint._yn('Partage le même lit',rel.meme_lit,true)}
    </div>
  </div>`;

  // ── PAGE 5 : CONF P4 — Déplacements, sorties, activités ─────
  const marcheModal = [
    dep.marche_modalites?.seul&&'Seul(e)', dep.marche_modalites?.aide&&'Avec aide',
    dep.marche_modalites?.materiel&&'Matériel', dep.marche_modalites?.moins_30&&'<30min',
    dep.marche_modalites?.trente_a_soixante&&'30-60min', dep.marche_modalites?.plus_1h&&'>1h'
  ].filter(Boolean).join(', ');

  pages += `<div class="lp-page">
    ${HDR('Fiche Confidentielle','Page 4 — Déplacements, fauteuil, sorties, activités')}
    ${SEC('Déplacements')}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Se repère dans l\'espace',dep.repere_espace,true)}
      ${LysPrint._yn('Se repère dans le temps',dep.repere_temps,true)}
      ${LysPrint._yn('Fatigable',dep.fatigable,true)}
      ${LysPrint._yn('Marche',dep.marche,true)}
    </div>
    ${R2('Modalités de marche',marcheModal,'Vitesse / Rythme',dep.marche_vitesse)}
    ${R3('Monte un escalier',dep.escalier,'Déplacement intérieur',dep.deplacement_int,'Déplacement extérieur',dep.deplacement_ext)}
    ${LysPrint._yn('Tient le bras de l\'accompagnateur',dep.tenir_bras)}
    ${TA('Informations complémentaires (déplacements)',dep.info_comp)}

    ${dep.fauteuil?.appui_plantaire||dep.fauteuil?.occasionnel||dep.fauteuil?.permanent ? `
    ${SEC('Pour les personnes en fauteuil','orange')}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Occasionnellement (longues sorties)',dep.fauteuil?.occasionnel,true)}
      ${LysPrint._yn('En permanence',dep.fauteuil?.permanent,true)}
      ${LysPrint._yn('Peut se tenir debout',dep.fauteuil?.debout,true)}
      ${LysPrint._yn('Appui plantaire (obligatoire)',dep.fauteuil?.appui_plantaire,true)}
      ${LysPrint._yn('Transfert avec aide (trafic)',dep.fauteuil?.transfert_vehicule,true)}
      ${LysPrint._yn('Manœuvre seul intérieur',dep.fauteuil?.manoeuvre_int,true)}
      ${LysPrint._yn('Manœuvre seul extérieur',dep.fauteuil?.manoeuvre_ext,true)}
    </div>` : ''}

    ${SEC('Sorties','orange')}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Sort seul sans accompagnement',sort.seul,true)}
      ${LysPrint._yn('Sort seul en groupe',sort.groupe,true)}
      ${LysPrint._yn('Sait demander son chemin',sort.chemin,true)}
      ${LysPrint._yn('Rentre à une heure fixe',sort.heure_fixe,true)}
      ${LysPrint._yn('Garde son argent sur lui/elle',sort.argent_garde,true)}
      ${LysPrint._yn('Peut se mettre en danger',sort.danger,true)}
    </div>
    ${F('Gère son argent', sort.argent==='seul'?'Oui (seul)':sort.argent==='avec_aide'?'Avec aide':'Non')}
    ${sort.danger==='oui' ? F('Précision danger',sort.danger_detail) : ''}

    ${SEC('Activités','orange')}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Sait nager',act.nage,true)}
      ${LysPrint._yn('Sait choisir parmi des activités',act.choix,true)}
    </div>
    ${TA('Centres d\'intérêt',act.interets)}
    ${TA('Activités interdites',act.interdites)}
  </div>`;

  // ── PAGE 6 : CONF P5 — Troubles & habitudes ─────────────────
  pages += `<div class="lp-page">
    ${HDR('Fiche Confidentielle','Page 5 — Troubles & habitudes de vie')}
    ${SEC('Troubles du comportement')}
    ${LysPrint._troubles(trou.liste)}
    ${TA('Solutions pour gérer les troubles du comportement',trou.solutions)}

    ${SEC('Habitudes de vie — Tabac','orange')}
    ${LysPrint._yn('Fumeur',hab.fumeur)}
    ${hab.fumeur==='oui' ? `
      ${R2('Fréquence',hab.fumeur_freq,'Gère seul(e)',hab.fumeur_seul==='oui'?'Oui':'Non')}
      ${LysPrint._yn('Frustration par la limite de cigarettes',hab.fumeur_frustre)}
      ${hab.fumeur_frustre==='oui' ? F('Comportement si frustré',hab.fumeur_comportement) : ''}
      ${F('Protocole cigarette',hab.fumeur_protocole)}` : ''}

    ${SEC('Habitudes de vie — Alcool','orange')}
    ${LysPrint._yn('Peut consommer de l\'alcool',hab.alcool)}
    ${hab.alcool==='oui' ? F('Fréquence',hab.alcool_freq) : ''}
    ${R2('Type d\'achat à éviter',hab.alcool_eviter||'—','Préférences d\'achat',hab.alcool_preferences||'—')}
  </div>`;

  // ── PAGE 7 : CONF P6 — Santé ────────────────────────────────
  pages += `<div class="lp-page">
    ${HDR('Fiche Confidentielle','Page 6 — Santé, médicaments, déficiences')}
    <div class="lp-alert">📋 Chaque médicament doit être accompagné de son ordonnance <strong>DANS LA VALISE</strong> au moment du séjour.</div>

    ${SEC('Traitement médical & soins','red')}
    ${LysPrint._yn('Traitement médical',sante.traitement)}
    ${sante.traitement==='oui' ? `
      <div class="lp-yn-inline-wrap">
        ${LysPrint._yn('Prend seul(e)',sante.traitement_seul,true)}
        ${LysPrint._yn('Soins corporels',sante.soins_corporels,true)}
        ${LysPrint._yn('Bas de contention',sante.bas_contention,true)}
      </div>
      ${sante.soins_corporels==='oui' ? TA('Précision soins et fréquence',sante.soins_detail) : ''}
      ${sante.bas_contention==='oui' ? F('Protocole contention',sante.contention_protocole) : ''}` : ''}

    ${SEC('Soins infirmiers','red')}
    ${LysPrint._yn('Soins infirmiers',sante.soins_infirmiers)}
    ${sante.soins_infirmiers==='oui' ? `
      ${TA('Détail soins et fréquence',sante.soins_infirm_detail)}
      ${CHK('Injections',[['matin','Matin'],['midi','Midi'],['soir','Soir'],['non','Aucune']],sante.injections)}
      <div class="lp-alert lp-alert-red">⚠️ Toutes injections nécessite le passage d'une IDE. Ordonnance + carte vitale (PAS DE PHOTOCOPIE) ou attestation de droit obligatoires.</div>` : ''}

    ${SEC('Pathologies','red')}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Diabétique',sante.diabete,true)}
      ${LysPrint._yn('Asthmatique',sante.asthme,true)}
      ${LysPrint._yn('Épilepsie',sante.epilepsie,true)}
    </div>
    ${sante.diabete==='oui' ? CHK('Injections diabète',[['matin','Matin'],['midi','Midi'],['soir','Soir'],['non','Aucune']],sante.diabete_injections) : ''}
    ${sante.epilepsie==='oui' ? `
      ${R2('Stabilisée',sante.epilepsie_stabilisee==='oui'?'Oui':'Non','Dernière crise',sante.epilepsie_date)}
      ${TA('Protocole crise épilepsie',sante.epilepsie_protocole)}` : ''}

    ${SEC('Déficiences & appareillage')}
    <div class="lp-yn-inline-wrap">
      ${LysPrint._yn('Non voyant',sante.non_voyant,true)}
      ${LysPrint._yn('Mal voyant',sante.mal_voyant,true)}
      ${LysPrint._yn('Sourd',sante.sourd,true)}
      ${LysPrint._yn('Malentendant',sante.malentendant,true)}
      ${LysPrint._yn('Port d\'appareillage',sante.appareillage,true)}
      ${sante.appareillage==='oui' ? F('Type',sante.appareillage_type) : ''}
      ${LysPrint._yn('Porte un dentier',sante.dentier,true)}
      ${sante.dentier==='oui' ? LysPrint._yn('Gère le dentier seul(e)',sante.dentier_seul,true) : ''}
      ${LysPrint._yn('Porte des lunettes',sante.lunettes,true)}
    </div>

    ${SEC('Données médicales')}
    ${R2('Poids',sante.poids?sante.poids+' kg':'—','Taille',sante.taille?sante.taille+' cm':'—')}
    ${TA('Antécédents médicaux',sante.antecedents)}

    ${SEC('Autorisation image & signature','grey')}
    ${R2('Autorisation image de',conf.autorisation_image?.nom,'Accordée',sante.autorisation_image==='oui'?'Oui':conf.autorisation_image?.autorisation==='oui'?'Oui':'Non')}
    <div class="lp-sig">
      ${R3('Fait à',conf.signature?.fait_a,'Le',conf.signature?.date,'Qualité du signataire',conf.signature?.qualite)}
      <div class="lp-sig-line">Signature :</div>
    </div>

    <div class="lp-footer">La Lysardière — 84 Route de Sainte Mondane, 24370 Saint Julien de Lampon — 05 53 30 57 15 / 06 03 88 15 13</div>
  </div>`;

  return pages;
};

// ── FONCTION PRINCIPALE : openPrintWindow ────────────────────────
function openPrintWindow(html, options) {
  options = options || {};
  const title = options.title || 'La Lysardière — Impression';

  // Remove existing print iframe/bar if any
  const oldIframe = document.getElementById('lys-print-iframe');
  const oldBar = document.getElementById('lys-print-bar');
  if(oldIframe) oldIframe.remove();
  if(oldBar) oldBar.remove();

  const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    ${LYS_PRINT_CSS}
    /* Force @page margin to 0 — on gère tout via padding body */
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    /* Aperçu écran : padding visible */
    body {
      padding: 18mm 16mm;
      font-family: Arial, Helvetica, sans-serif;
    }
    /* Impression : même padding — c'est lui qui fait les marges */
    @media print {
      body {
        padding: 18mm 16mm !important;
      }
    }
    /* Page breaks */
    .lp-page {
      margin: 0;
      padding: 0;
    }
    .lp-page + .lp-page {
      padding-top: 18mm;
    }
  </style>
</head>
<body>${html}</body>
</html>`;

  // Open new window
  const w = window.open('', '_blank', 'width=900,height=700');
  if(!w) { alert('Autorisez les popups pour cette page.'); return; }

  w.document.write(fullHtml);
  w.document.close();

  // Print from parent after new window is loaded — avoids Chrome popup print block
  const printWhenReady = setInterval(function() {
    if(w.document.readyState === 'complete') {
      clearInterval(printWhenReady);
      setTimeout(function() {
        w.focus();
        w.print();
      }, 300);
    }
  }, 50);
}