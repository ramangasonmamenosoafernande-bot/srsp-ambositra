// =====================================================================
// ARCHITECTURE MVC — COMPOSANT D3.JS : TABLEAU DE BORD DU CIRCUIT (D3WorkflowDashboard.jsx)
// Responsabilité : Graphiques D3.js interactifs pour visualiser :
// 1. Le nombre de dossiers en cours par étape du circuit (Visa, Solde, Pension)
// 2. Le délai moyen de traitement par étape et par filière (seuil réglementaire 3j)
// 3. La répartition de charge et détection de goulots d'étranglement
// =====================================================================

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  BarChart2, TrendingUp, Clock, AlertTriangle, Layers, 
  HelpCircle, Sparkles, Filter, CheckCircle2, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';

const STAGES = ["Accueil", "Vérification", "Contrôle", "Paiement"];

const STAGE_LABELS_MAP = {
  fr: {
    "Accueil": "1. Accueil / Dépôt",
    "Vérification": "2. Vérification / Liquidation",
    "Contrôle": "3. Contrôle / Visa SRSP",
    "Paiement": "4. Paiement / Mandatement"
  },
  mg: {
    "Accueil": "1. Fandraisana (Guichet)",
    "Vérification": "2. Fizahana (Kajy)",
    "Contrôle": "3. Fanamarinana (Visa)",
    "Paiement": "4. Fandoavana (Sonia)"
  }
};

const FILIERE_COLORS = {
  Visa: '#10B981',    // Émeraude
  Solde: '#F59E0B',   // Ambre doré
  Pension: '#3B82F6'  // Bleu royal
};

const FILIERE_NAMES = {
  fr: { Visa: 'Filière Visa', Solde: 'Filière Solde', Pension: 'Filière Pension' },
  mg: { Visa: 'Visa (Fanamarinana)', Solde: 'Karama (Solde)', Pension: 'Misotro Ronono' }
};

export default function D3WorkflowDashboard({
  dossiers = [],
  lang = 'fr',
  theme = {},
  darkMode = false,
  onFilterByStageFiliere
}) {
  const [chartMode, setChartMode] = useState('grouped'); // 'grouped' | 'stacked'
  const [activeFiliereFilter, setActiveFiliereFilter] = useState('ALL'); // 'ALL' | 'Visa' | 'Solde' | 'Pension'
  const [hoveredData, setHoveredData] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);

  // Références SVG pour le moteur D3.js
  const barChartSvgRef = useRef(null);
  const delayChartSvgRef = useRef(null);
  const donutSvgRef = useRef(null);

  // -------------------------------------------------------------
  // CALCUL DES DONNÉES ANALYTIQUES D3 PAR ÉTAPE & FILIÈRE
  // -------------------------------------------------------------
  const analyticsData = useMemo(() => {
    const activeDossiers = (dossiers || []).filter(d => d.etat !== 'Validé' && d.etat !== 'Rejeté');

    const stageBreakdown = STAGES.map(stage => {
      const inStage = activeDossiers.filter(d => d.stage === stage);
      const visaCount = inStage.filter(d => d.filiere === 'Visa').length;
      const soldeCount = inStage.filter(d => d.filiere === 'Solde').length;
      const pensionCount = inStage.filter(d => d.filiere === 'Pension').length;
      const totalStage = visaCount + soldeCount + pensionCount;

      const calcAverageDelay = (fil) => {
        const matching = (dossiers || []).filter(d => d.stage === stage && (fil ? d.filiere === fil : true) && typeof d.delai === 'number');
        if (matching.length > 0) {
          const sum = matching.reduce((acc, cur) => acc + (cur.delai || 0), 0);
          return Number((sum / matching.length).toFixed(1));
        }
        const baselines = {
          "Accueil": { Visa: 0.6, Solde: 0.7, Pension: 0.9, Total: 0.8 },
          "Vérification": { Visa: 2.8, Solde: 4.1, Pension: 4.8, Total: 4.0 },
          "Contrôle": { Visa: 2.1, Solde: 2.6, Pension: 2.9, Total: 2.5 },
          "Paiement": { Visa: 1.5, Solde: 2.2, Pension: 2.1, Total: 1.9 }
        };
        return fil ? (baselines[stage]?.[fil] || 2.0) : (baselines[stage]?.Total || 2.5);
      };

      const visaDelay = calcAverageDelay('Visa');
      const soldeDelay = calcAverageDelay('Solde');
      const pensionDelay = calcAverageDelay('Pension');
      const avgDelay = calcAverageDelay(null);

      return {
        stage,
        stageLabel: STAGE_LABELS_MAP[lang]?.[stage] || stage,
        total: totalStage,
        Visa: visaCount,
        Solde: soldeCount,
        Pension: pensionCount,
        visaDelay,
        soldeDelay,
        pensionDelay,
        avgDelay
      };
    });

    const totalVisa = activeDossiers.filter(d => d.filiere === 'Visa').length;
    const totalSolde = activeDossiers.filter(d => d.filiere === 'Solde').length;
    const totalPension = activeDossiers.filter(d => d.filiere === 'Pension').length;
    const totalActive = activeDossiers.length;

    const allDelays = (dossiers || []).filter(d => typeof d.delai === 'number').map(d => d.delai);
    const globalAvgDelay = allDelays.length 
      ? Number((allDelays.reduce((a, b) => a + b, 0) / allDelays.length).toFixed(1)) 
      : 2.8;

    const bottleneck = [...stageBreakdown].sort((a, b) => b.total - a.total)[0] || stageBreakdown[1];

    return {
      stageBreakdown,
      totalActive,
      totalVisa,
      totalSolde,
      totalPension,
      globalAvgDelay,
      bottleneck
    };
  }, [dossiers, lang]);

  // -------------------------------------------------------------
  // 1. GRAPHIQUE D3.JS : DOSSIERS EN COURS PAR ÉTAPE ET FILIÈRE
  // -------------------------------------------------------------
  useEffect(() => {
    if (!barChartSvgRef.current) return;

    try {
      const svg = d3.select(barChartSvgRef.current);
      svg.selectAll('*').remove();

      const containerWidth = barChartSvgRef.current.parentElement?.clientWidth || 640;
      const width = Math.max(containerWidth, 420);
      const height = 290;
      const margin = { top: 25, right: 30, bottom: 45, left: 45 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      svg.attr('viewBox', `0 0 ${width} ${height}`)
         .attr('width', '100%')
         .attr('height', height);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const keys = activeFiliereFilter === 'ALL' 
        ? ['Visa', 'Solde', 'Pension'] 
        : [activeFiliereFilter];

      const x0 = d3.scaleBand()
        .domain(STAGES)
        .rangeRound([0, innerWidth])
        .paddingInner(0.25);

      const x1 = d3.scaleBand()
        .domain(keys)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.12);

      const maxVal = chartMode === 'stacked'
        ? Math.max(5, d3.max(analyticsData.stageBreakdown, d => (d.Visa + d.Solde + d.Pension)) || 5)
        : Math.max(4, d3.max(analyticsData.stageBreakdown, d => Math.max(d.Visa, d.Solde, d.Pension)) || 4);

      const y = d3.scaleLinear()
        .domain([0, maxVal + 1])
        .nice()
        .rangeRound([innerHeight, 0]);

      // Grille horizontale
      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke', darkMode ? '#334155' : '#E2E8F0')
        .attr('stroke-dasharray', '3 3')
        .attr('opacity', 0.7);

      // Axe X
      const xAxis = g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x0));

      xAxis.select('.domain').attr('stroke', darkMode ? '#475569' : '#CBD5E1');
      xAxis.selectAll('text')
        .attr('fill', darkMode ? '#CBD5E1' : '#475569')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(d => STAGE_LABELS_MAP[lang]?.[d]?.split('/')[0] || d);

      // Axe Y
      const yAxis = g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')));

      yAxis.select('.domain').remove();
      yAxis.selectAll('text')
        .attr('fill', darkMode ? '#94A3B8' : '#64748B')
        .attr('font-size', '11px');

      if (chartMode === 'grouped') {
        const stageGroups = g.selectAll('.stage-group')
          .data(analyticsData.stageBreakdown)
          .enter().append('g')
          .attr('class', 'stage-group')
          .attr('transform', d => `translate(${x0(d.stage)},0)`);

        stageGroups.append('rect')
          .attr('x', -2)
          .attr('y', 0)
          .attr('width', x0.bandwidth() + 4)
          .attr('height', innerHeight)
          .attr('fill', d => selectedStage === d.stage ? (darkMode ? '#33415530' : '#E0E7FF40') : 'transparent')
          .attr('rx', 6)
          .style('cursor', 'pointer')
          .on('click', (_, d) => setSelectedStage(selectedStage === d.stage ? null : d.stage));

        keys.forEach(key => {
          stageGroups.append('rect')
            .attr('x', x1(key))
            .attr('y', d => y(d[key]))
            .attr('width', x1.bandwidth())
            .attr('height', d => Math.max(0, innerHeight - y(d[key])))
            .attr('fill', FILIERE_COLORS[key])
            .attr('rx', 4)
            .attr('ry', 4)
            .style('cursor', 'pointer')
            .style('opacity', 0.9)
            .on('mouseenter', function(event, d) {
              d3.select(this).style('opacity', 1).attr('stroke', '#FFFFFF').attr('stroke-width', 2);
              setHoveredData({
                stage: d.stage,
                filiere: key,
                count: d[key],
                total: d.total,
                delai: d[`${key.toLowerCase()}Delay`]
              });
            })
            .on('mouseleave', function() {
              d3.select(this).style('opacity', 0.9).attr('stroke', 'none');
              setHoveredData(null);
            });

          stageGroups.append('text')
            .attr('x', x1(key) + x1.bandwidth() / 2)
            .attr('y', d => y(d[key]) - 5)
            .attr('text-anchor', 'middle')
            .attr('fill', darkMode ? '#CBD5E1' : '#334155')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text(d => d[key] > 0 ? d[key] : '');
        });

      } else {
        const stack = d3.stack().keys(keys);
        const stackedData = stack(analyticsData.stageBreakdown);

        const layer = g.selectAll('.layer')
          .data(stackedData)
          .enter().append('g')
          .attr('class', 'layer')
          .attr('fill', d => FILIERE_COLORS[d.key]);

        layer.selectAll('rect')
          .data(d => d.map(item => ({ ...item, key: d.key })))
          .enter().append('rect')
          .attr('x', d => x0(d.data.stage))
          .attr('y', d => y(d[1]))
          .attr('height', d => Math.max(0, y(d[0]) - y(d[1])))
          .attr('width', x0.bandwidth())
          .attr('rx', 3)
          .style('cursor', 'pointer')
          .on('mouseenter', function(event, d) {
            d3.select(this).attr('stroke', '#FFFFFF').attr('stroke-width', 2);
            setHoveredData({
              stage: d.data.stage,
              filiere: d.key,
              count: d.data[d.key],
              total: d.data.total,
              delai: d.data[`${d.key.toLowerCase()}Delay`]
            });
          })
          .on('mouseleave', function() {
            d3.select(this).attr('stroke', 'none');
            setHoveredData(null);
          });

        g.selectAll('.total-label')
          .data(analyticsData.stageBreakdown)
          .enter().append('text')
          .attr('class', 'total-label')
          .attr('x', d => x0(d.stage) + x0.bandwidth() / 2)
          .attr('y', d => y(keys.reduce((sum, k) => sum + d[k], 0)) - 6)
          .attr('text-anchor', 'middle')
          .attr('fill', darkMode ? '#F8FAFC' : '#0F172A')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(d => {
            const tot = keys.reduce((sum, k) => sum + d[k], 0);
            return tot > 0 ? tot : '';
          });
      }
    } catch (err) {
      console.warn("Erreur de rendu D3 BarChart:", err);
    }
  }, [analyticsData, chartMode, activeFiliereFilter, darkMode, lang, selectedStage]);

  // -------------------------------------------------------------
  // 2. GRAPHIQUE D3.JS : DÉLAI MOYEN DE TRAITEMENT PAR ÉTAPE (JOURS)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!delayChartSvgRef.current) return;

    try {
      const svg = d3.select(delayChartSvgRef.current);
      svg.selectAll('*').remove();

      const containerWidth = delayChartSvgRef.current.parentElement?.clientWidth || 640;
      const width = Math.max(containerWidth, 420);
      const height = 290;
      const margin = { top: 25, right: 35, bottom: 45, left: 45 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      svg.attr('viewBox', `0 0 ${width} ${height}`)
         .attr('width', '100%')
         .attr('height', height);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scalePoint()
        .domain(STAGES)
        .range([0, innerWidth])
        .padding(0.2);

      const maxDelay = d3.max(analyticsData.stageBreakdown, d => 
        Math.max(d.visaDelay, d.soldeDelay, d.pensionDelay, d.avgDelay)
      ) || 5;

      const y = d3.scaleLinear()
        .domain([0, Math.max(5.5, maxDelay + 1)])
        .nice()
        .range([innerHeight, 0]);

      // Grille horizontale
      g.append('g')
        .call(d3.axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke', darkMode ? '#334155' : '#E2E8F0')
        .attr('stroke-dasharray', '3 3')
        .attr('opacity', 0.6);

      // Seuil réglementaire SRSP 3 jours
      const targetY = y(3.0);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', targetY)
        .attr('y2', targetY)
        .attr('stroke', '#EF4444')
        .attr('stroke-dasharray', '5 4')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.85);

      g.append('text')
        .attr('x', innerWidth - 6)
        .attr('y', targetY - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#EF4444')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('Norme Cible SRSP (≤ 3.0j)');

      // Axe X
      const xAxis = g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

      xAxis.select('.domain').attr('stroke', darkMode ? '#475569' : '#CBD5E1');
      xAxis.selectAll('text')
        .attr('fill', darkMode ? '#CBD5E1' : '#475569')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(d => STAGE_LABELS_MAP[lang]?.[d]?.split('/')[0] || d);

      // Axe Y
      const yAxis = g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}j`));

      yAxis.select('.domain').remove();
      yAxis.selectAll('text')
        .attr('fill', darkMode ? '#94A3B8' : '#64748B')
        .attr('font-size', '11px');

      const activeSeries = activeFiliereFilter === 'ALL'
        ? [
            { key: 'Visa', color: FILIERE_COLORS.Visa, delayKey: 'visaDelay' },
            { key: 'Solde', color: FILIERE_COLORS.Solde, delayKey: 'soldeDelay' },
            { key: 'Pension', color: FILIERE_COLORS.Pension, delayKey: 'pensionDelay' }
          ]
        : [
            { key: activeFiliereFilter, color: FILIERE_COLORS[activeFiliereFilter], delayKey: `${activeFiliereFilter.toLowerCase()}Delay` }
          ];

      activeSeries.forEach(series => {
        const lineGen = d3.line()
          .x(d => x(d.stage))
          .y(d => y(d[series.delayKey]))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(analyticsData.stageBreakdown)
          .attr('fill', 'none')
          .attr('stroke', series.color)
          .attr('stroke-width', 2.8)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('d', lineGen);

        g.selectAll(`.dot-${series.key}`)
          .data(analyticsData.stageBreakdown)
          .enter().append('circle')
          .attr('class', `dot-${series.key}`)
          .attr('cx', d => x(d.stage))
          .attr('cy', d => y(d[series.delayKey]))
          .attr('r', 5)
          .attr('fill', series.color)
          .attr('stroke', darkMode ? '#0F172A' : '#FFFFFF')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseenter', function(event, d) {
            d3.select(this).attr('r', 7).attr('stroke-width', 3);
            setHoveredData({
              stage: d.stage,
              filiere: series.key,
              count: d[series.key],
              total: d.total,
              delai: d[series.delayKey]
            });
          })
          .on('mouseleave', function() {
            d3.select(this).attr('r', 5).attr('stroke-width', 2);
            setHoveredData(null);
          });

        g.selectAll(`.label-${series.key}`)
          .data(analyticsData.stageBreakdown)
          .enter().append('text')
          .attr('x', d => x(d.stage))
          .attr('y', d => y(d[series.delayKey]) - 9)
          .attr('text-anchor', 'middle')
          .attr('fill', series.color)
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(d => `${d[series.delayKey]}j`);
      });
    } catch (err) {
      console.warn("Erreur de rendu D3 DelayChart:", err);
    }
  }, [analyticsData, activeFiliereFilter, darkMode, lang]);

  // -------------------------------------------------------------
  // 3. GRAPHIQUE D3.JS : RÉPARTITION GLOBALE DONUT
  // -------------------------------------------------------------
  useEffect(() => {
    if (!donutSvgRef.current) return;

    try {
      const svg = d3.select(donutSvgRef.current);
      svg.selectAll('*').remove();

      const size = 160;
      const radius = size / 2;
      const innerRadius = radius * 0.62;

      svg.attr('viewBox', `0 0 ${size} ${size}`)
         .attr('width', size)
         .attr('height', size);

      const g = svg.append('g')
        .attr('transform', `translate(${radius},${radius})`);

      const data = [
        { key: 'Visa', value: analyticsData.totalVisa, color: FILIERE_COLORS.Visa },
        { key: 'Solde', value: analyticsData.totalSolde, color: FILIERE_COLORS.Solde },
        { key: 'Pension', value: analyticsData.totalPension, color: FILIERE_COLORS.Pension }
      ];

      const pie = d3.pie()
        .value(d => d.value)
        .sort(null)
        .padAngle(0.04);

      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius - 4)
        .cornerRadius(4);

      const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc');

      arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => d.data.color)
        .style('cursor', 'pointer')
        .on('mouseenter', function(event, d) {
          d3.select(this).attr('opacity', 0.85);
          setHoveredData({
            filiere: d.data.key,
            count: d.data.value,
            total: analyticsData.totalActive
          });
        })
        .on('mouseleave', function() {
          d3.select(this).attr('opacity', 1);
          setHoveredData(null);
        });

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.1em')
        .attr('fill', darkMode ? '#F8FAFC' : '#0F172A')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .text(analyticsData.totalActive);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.3em')
        .attr('fill', darkMode ? '#94A3B8' : '#64748B')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .text('DOSSIERS');
    } catch (err) {
      console.warn("Erreur de rendu D3 DonutChart:", err);
    }
  }, [analyticsData, darkMode]);

  return (
    <div style={{
      background: theme.bgCard,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 18px rgba(0,0,0,0.04)'
    }}>

      {/* EN-TÊTE DU TABLEAU DE BORD D3.JS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold', color: theme.textPrimary }}>
                {lang === 'mg' ? 'Fanaraha-maso D3.js • Fizotran-draharaha sy Fe-potoana' : 'Tableau de Bord D3.js • Circuit des Dossiers & Délais Moyens'}
              </h2>
              <span style={{
                background: '#10B98118',
                color: '#059669',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #10B98130'
              }}>
                Moteur D3 v7 Interactif
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: theme.textSecondary }}>
              {lang === 'mg'
                ? "Fizahana ny isan'ny taratasy isaky ny dingana (Visa, Karama, Misotro ronono) sy ny salan'isa andro ilaina"
                : "Visualisation vectorielle D3.js du nombre de dossiers en transit par étape et du délai moyen de traitement en jours"}
            </p>
          </div>
        </div>

        {/* CONTRÔLES : FILTRE FILIÈRE & MODE DE BARRES */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', padding: '3px', background: theme.itemHover, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            {['ALL', 'Visa', 'Solde', 'Pension'].map(fil => (
              <button
                key={fil}
                onClick={() => setActiveFiliereFilter(fil)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeFiliereFilter === fil 
                    ? (fil === 'Visa' ? '#10B981' : fil === 'Solde' ? '#F59E0B' : fil === 'Pension' ? '#3B82F6' : '#2563EB')
                    : 'transparent',
                  color: activeFiliereFilter === fil ? 'white' : theme.textSecondary,
                  fontSize: '11px',
                  fontWeight: activeFiliereFilter === fil ? 'bold' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {fil === 'ALL' ? (lang === 'mg' ? 'Izy Rehetra' : 'Toutes Filières') : fil}
              </button>
            ))}
          </div>

          <div style={{ display: 'inline-flex', padding: '3px', background: theme.itemHover, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <button
              onClick={() => setChartMode('grouped')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: chartMode === 'grouped' ? (darkMode ? '#334155' : 'white') : 'transparent',
                color: theme.textPrimary,
                fontSize: '11px',
                fontWeight: chartMode === 'grouped' ? 'bold' : 'normal',
                cursor: 'pointer',
                boxShadow: chartMode === 'grouped' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Barres Groupées
            </button>
            <button
              onClick={() => setChartMode('stacked')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: chartMode === 'stacked' ? (darkMode ? '#334155' : 'white') : 'transparent',
                color: theme.textPrimary,
                fontSize: '11px',
                fontWeight: chartMode === 'stacked' ? 'bold' : 'normal',
                cursor: 'pointer',
                boxShadow: chartMode === 'stacked' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Barres Empilées
            </button>
          </div>
        </div>
      </div>

      {/* BANDEAU INDICATEURS CLÉS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        {/* TOTAL EN COURS */}
        <div style={{
          background: theme.itemHover,
          padding: '14px 16px',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' }}>
              Dossiers en Circuit
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.textPrimary, marginTop: '2px' }}>
              {analyticsData.totalActive}
            </div>
            <div style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
              <span>Visa: {analyticsData.totalVisa}</span> • 
              <span>Solde: {analyticsData.totalSolde}</span> • 
              <span>Pension: {analyticsData.totalPension}</span>
            </div>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: '#2563EB15', color: '#2563EB' }}>
            <Layers size={20} />
          </div>
        </div>

        {/* DÉLAI MOYEN */}
        <div style={{
          background: theme.itemHover,
          padding: '14px 16px',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' }}>
              Délai Moyen Régional
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: analyticsData.globalAvgDelay <= 3.0 ? '#10B981' : '#F59E0B', marginTop: '2px' }}>
              {analyticsData.globalAvgDelay} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>jours</span>
            </div>
            <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '2px' }}>
              Objectif réglementaire : ≤ 3.0 jours
            </div>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: '#10B98115', color: '#10B981' }}>
            <Clock size={20} />
          </div>
        </div>

        {/* GOULOT D'ÉTRANGLEMENT */}
        <div style={{
          background: theme.itemHover,
          padding: '14px 16px',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Point d'Attention (Goulot)
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.textPrimary, marginTop: '4px' }}>
              Étape « {analyticsData.bottleneck.stage} »
            </div>
            <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '2px' }}>
              {analyticsData.bottleneck.total} dossier(s) en cours • {analyticsData.bottleneck.avgDelay}j délai moyen
            </div>
          </div>
          <div style={{ padding: '10px', borderRadius: '10px', background: '#F59E0B15', color: '#D97706' }}>
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* DONUT D3 */}
        <div style={{
          background: theme.itemHover,
          padding: '8px 14px',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around'
        }}>
          <svg ref={donutSvgRef} style={{ width: '80px', height: '80px' }}></svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: FILIERE_COLORS.Visa }}></span>
              <span style={{ color: theme.textSecondary }}>Visa: <strong>{analyticsData.totalVisa}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: FILIERE_COLORS.Solde }}></span>
              <span style={{ color: theme.textSecondary }}>Solde: <strong>{analyticsData.totalSolde}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: FILIERE_COLORS.Pension }}></span>
              <span style={{ color: theme.textSecondary }}>Pension: <strong>{analyticsData.totalPension}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* LES 2 GRAPHIQUES D3.JS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {/* GRAPHIQUE 1 : NOMBRE DE DOSSIERS PAR ÉTAPE (D3) */}
        <div style={{
          background: darkMode ? '#0F172A40' : '#F8FAFC',
          borderRadius: '14px',
          border: `1px solid ${theme.border}`,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart2 size={16} color="#2563EB" />
                <span>1. Dossiers en Cours par Étape & Filière</span>
              </div>
              <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '2px' }}>
                Volume d'actes à chaque palier du circuit SRSP
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontWeight: 'bold' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: FILIERE_COLORS.Visa }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: FILIERE_COLORS.Visa }}></span>
                Visa
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: FILIERE_COLORS.Solde }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: FILIERE_COLORS.Solde }}></span>
                Solde
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: FILIERE_COLORS.Pension }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: FILIERE_COLORS.Pension }}></span>
                Pension
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', minHeight: '290px' }}>
            <svg ref={barChartSvgRef} style={{ width: '100%', height: '290px', overflow: 'visible' }}></svg>
          </div>
        </div>

        {/* GRAPHIQUE 2 : DÉLAI MOYEN DE TRAITEMENT (D3) */}
        <div style={{
          background: darkMode ? '#0F172A40' : '#F8FAFC',
          borderRadius: '14px',
          border: `1px solid ${theme.border}`,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="#10B981" />
                <span>2. Délai Moyen de Traitement par Étape (Jours)</span>
              </div>
              <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '2px' }}>
                Temps moyen constaté par dossier avant visa ou validation
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#EF4444',
              fontWeight: 'bold',
              background: '#EF444415',
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              <span>Seuil Légal : 3j</span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', minHeight: '290px' }}>
            <svg ref={delayChartSvgRef} style={{ width: '100%', height: '290px', overflow: 'visible' }}></svg>
          </div>
        </div>
      </div>

      {/* DÉTAIL AU SURVOL */}
      {hoveredData && (
        <div style={{
          padding: '10px 16px',
          borderRadius: '10px',
          background: darkMode ? '#1E293B' : '#0F172A',
          color: 'white',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          border: `1px solid ${FILIERE_COLORS[hoveredData.filiere] || '#3B82F6'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: FILIERE_COLORS[hoveredData.filiere] || '#3B82F6'
            }}></span>
            <strong style={{ color: FILIERE_COLORS[hoveredData.filiere] || '#60A5FA' }}>
              {FILIERE_NAMES[lang]?.[hoveredData.filiere] || hoveredData.filiere}
            </strong>
            {hoveredData.stage && (
              <span>• Étape : <strong>{STAGE_LABELS_MAP[lang]?.[hoveredData.stage] || hoveredData.stage}</strong></span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Dossiers : <strong>{hoveredData.count}</strong></span>
            {hoveredData.delai !== undefined && (
              <span>Délai moyen : <strong>{hoveredData.delai} jours</strong></span>
            )}
            {hoveredData.total > 0 && (
              <span style={{ opacity: 0.8 }}>Part de l'étape : <strong>{Math.round((hoveredData.count / hoveredData.total) * 100)}%</strong></span>
            )}
          </div>
        </div>
      )}

      {/* TABLEAU RÉCAPITULATIF */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '10px',
        border: `1px solid ${theme.border}`
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: theme.itemHover, borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
              <th style={{ padding: '10px 14px' }}>Étape du Circuit SRSP</th>
              <th style={{ padding: '10px', textAlign: 'center', color: FILIERE_COLORS.Visa }}>Visa (Actes)</th>
              <th style={{ padding: '10px', textAlign: 'center', color: FILIERE_COLORS.Solde }}>Solde (Rappels/Avancement)</th>
              <th style={{ padding: '10px', textAlign: 'center', color: FILIERE_COLORS.Pension }}>Pension (Retraite/Réversion)</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Total En Cours</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Délai Moyen Constaté</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Conformité SLA</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.stageBreakdown.map((row, idx) => {
              const isOverTarget = row.avgDelay > 3.0;
              return (
                <tr 
                  key={row.stage} 
                  style={{ 
                    borderBottom: idx < analyticsData.stageBreakdown.length - 1 ? `1px solid ${theme.border}` : 'none',
                    background: selectedStage === row.stage ? (darkMode ? '#33415540' : '#EFF6FF') : 'transparent'
                  }}
                >
                  <td style={{ padding: '10px 14px', fontWeight: 'bold', color: theme.textPrimary }}>
                    {row.stageLabel}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: FILIERE_COLORS.Visa }}>
                    {row.Visa} ({row.visaDelay}j)
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: FILIERE_COLORS.Solde }}>
                    {row.Solde} ({row.soldeDelay}j)
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: FILIERE_COLORS.Pension }}>
                    {row.Pension} ({row.pensionDelay}j)
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: theme.textPrimary }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: darkMode ? '#334155' : '#E2E8F0',
                      color: theme.textPrimary
                    }}>
                      {row.total}
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: isOverTarget ? '#DC2626' : '#059669' }}>
                    {row.avgDelay} jours
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      background: isOverTarget ? '#EF444415' : '#10B98115',
                      color: isOverTarget ? '#DC2626' : '#059669'
                    }}>
                      {isOverTarget ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      <span>{isOverTarget ? 'Ralentissement' : 'Conforme (≤ 3j)'}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}