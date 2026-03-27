import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import { universities, categories, metrics } from '../data/universities';

const COLORS = ['#facc15', '#8b5cf6', '#0ea5e9', '#22c55e', '#f97316', '#06b6d4', '#a855f7'];
const CAT_COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#ef4444', '#22c55e'];

const strengths = [
  "Найбільший обсяг профільних КБ-дисциплін серед 7 ВУЗів (43% від обов\u2019язкових = 77 кр.)",
  "Повне покриття ядра КБ: Авторизовані системи (10 кр.), ТЗІ (10 кр.), Безпека ІКС (6.5 кр.), Захист в мережах (6.5 кр.)",
  "Унікальні дисципліни: криптоаналіз (3 кр.), кібероперації (4 кр.), OSINT (3 кр.)",
  "Управління ІБ та кібербезпекою (6 кр.) + Інформаційна та кібербезпека підприємства (6 кр.)",
];

const weaknesses = [
  "Іноземна мова: 6 кр. — найменше серед 7 ВУЗів (середнє 11 кр.). КНУ — 17 кр., ХПІ — 16 кр., Каразіна — 12 кр.",
  "Вища математика: 6 кр. — найменше (Каразіна — 17, ЛП — 16, ХПІ — 11, КНУ — 11 кр.)",
  "Немає дискретної математики як окремого курсу (є в ЛП, Каразіна, ЧНУ)",
  "Немає сучасних трендових дисциплін: ML для КБ (ХПІ), безпека IoT (ХПІ, ЧНУ), веббезпека (ХПІ)",
  "Немає розслідування інцидентів ІБ (є в ЛП, КНУ та ОНПУ)",
];

const uniFeatures = [
  { uni: "УжНУ", feature: "Максимальне ядро КБ: 77 кр. профільних дисциплін (43%), криптоаналіз, кібероперації, OSINT, управління ІБ", isMain: true },
  { uni: "Львів. Політехніка", feature: "Збалансована ІТ-підготовка: 47 кр. програмування, скриптові мови, хмарні технології, розслідування інцидентів, 4 вибіркові блоки" },
  { uni: "КНУ Шевченка", feature: "Фундаментальний: 17 кр. іноземної мови, 19 кр. математики, кіберпростір та протидія кіберзлочинності, електронний підпис" },
  { uni: "ХПІ", feature: "Сучасні тренди: соціальна інженерія, безпека IoT, ML для кібербезпеки, антивірусний захист, веббезпека, комплексний тренінг" },
  { uni: "ОНПУ", feature: "Практична КБ: 75 кр. профільних, ризики ІБ, управління доступом, оцінка захищеності ІС, реагування на інциденти, тестування на проникнення" },
  { uni: "Каразіна", feature: "Сильна математика: 49 кр., теорія чисел/груп/полів, дискретна математика (8 кр.), криптологія (8 кр.), КСЗІ (8 кр.), захист ІКС (13 кр.)" },
  { uni: "ЧНУ", feature: "Широке покриття: 50 кр. загальних, 23 кр. англійської, безпека IoT, архітектура безпеки, технічні системи охорони, міждисциплінарна КР" },
];

const catNames = ["Загальні", "Математика", "Програмування", "Кібербезпека", "Практики"];
const metricsArr = [metrics.general, metrics.mathScience, metrics.programmingIT, metrics.cybersecurityCore, metrics.practicesAttestation];

function DisciplineCompare() {
  // Build list of discipline "rows" that have data in at least 2 universities
  const disciplineOptions = useMemo(() => {
    const opts = [];
    categories.forEach(cat => {
      cat.rows.forEach(row => {
        const entries = row.disciplines;
        // Only include rows where UzhNU (index 0) has data AND at least 1 other uni too
        const uzhnu = entries[0];
        if (!uzhnu || uzhnu.credits == null) return;
        const othersWithData = entries.slice(1).filter(d => d && d.credits != null);
        if (othersWithData.length < 1) return;
        const label = uzhnu.name;
        const code = row.code || '';
        opts.push({ label: code ? `${code}: ${label}` : label, disciplines: entries });
      });
    });
    return opts;
  }, []);

  const [selectedIdx, setSelectedIdx] = useState(0);

  const selected = disciplineOptions[selectedIdx];
  const barData = selected ? universities.map((u, i) => ({
    name: u.name,
    credits: selected.disciplines[i] ? selected.disciplines[i].credits || 0 : 0,
    fill: COLORS[i],
    disciplineName: selected.disciplines[i] ? selected.disciplines[i].name : '—',
  })) : [];

  const maxCredits = Math.max(...barData.map(d => d.credits), 1);

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <select
        value={selectedIdx}
        onChange={e => setSelectedIdx(Number(e.target.value))}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginBottom: '1rem',
          background: 'var(--bg-card)',
          color: '#f1f5f9',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: '0.95rem',
        }}
      >
        {disciplineOptions.map((opt, i) => (
          <option key={i} value={i}>{opt.label}</option>
        ))}
      </select>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={barData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, Math.ceil(maxCredits * 1.2)]} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={140} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
            formatter={(value, name, props) => [`${value} кр.`, props.payload.disciplineName]}
          />
          <Bar dataKey="credits" name="Кредити">
            {barData.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const avg = useMemo(() =>
    Math.round(universities.reduce((s, u) => s + u.mandatory, 0) / universities.length),
    []
  );
  const min = Math.min(...universities.map(u => u.mandatory));
  const max = Math.max(...universities.map(u => u.mandatory));

  // Discipline count per university
  const disciplineCounts = useMemo(() => {
    return universities.map((_, uIdx) => {
      let count = 0;
      categories.forEach(cat => {
        cat.rows.forEach(row => {
          if (row.disciplines[uIdx] !== null) count++;
        });
      });
      return count;
    });
  }, []);

  // Unique disciplines (only in one university)
  const uniqueDisciplines = useMemo(() => {
    const result = [];
    categories.forEach(cat => {
      cat.rows.forEach(row => {
        const nonNull = row.disciplines.map((d, i) => d ? i : -1).filter(i => i >= 0);
        if (nonNull.length === 1) {
          const idx = nonNull[0];
          const d = row.disciplines[idx];
          result.push({ uni: universities[idx].name, name: d.name, credits: d.credits, uniIdx: idx });
        }
      });
    });
    return result;
  }, []);

  // Foreign language data
  const langData = useMemo(() => {
    const langRow = categories[0]?.rows[0];
    if (!langRow) return [];
    return universities.map((u, i) => ({
      name: u.name,
      credits: langRow.disciplines[i]?.credits || 0,
      fill: COLORS[i],
    }));
  }, []);

  // Pie data per uni
  const pieData = useMemo(() => {
    return universities.map((u, uIdx) => ({
      name: u.name,
      data: catNames.map((cn, ci) => ({ name: cn, value: metricsArr[ci][uIdx], color: CAT_COLORS[ci] })),
    }));
  }, []);

  // Heatmap data: categories x universities
  const heatmapData = useMemo(() => {
    return catNames.map((cn, ci) => {
      const vals = metricsArr[ci];
      const maxVal = Math.max(...vals);
      return {
        category: cn,
        values: vals.map((v, ui) => ({ value: v, intensity: maxVal > 0 ? v / maxVal : 0 })),
      };
    });
  }, []);

  const barData = universities.map((u, i) => ({
    name: u.name,
    'Загальні': metrics.general[i],
    'Математика': metrics.mathScience[i],
    'Програмування': metrics.programmingIT[i],
    'Кібербезпека': metrics.cybersecurityCore[i],
    'Практики': metrics.practicesAttestation[i],
  }));

  const radarData = [
    { subject: 'Загальні', ...Object.fromEntries(universities.map((u, i) => [u.name, metrics.general[i]])) },
    { subject: 'Математика', ...Object.fromEntries(universities.map((u, i) => [u.name, metrics.mathScience[i]])) },
    { subject: 'Програмування', ...Object.fromEntries(universities.map((u, i) => [u.name, metrics.programmingIT[i]])) },
    { subject: 'Кібербезпека', ...Object.fromEntries(universities.map((u, i) => [u.name, metrics.cybersecurityCore[i]])) },
    { subject: 'Практики', ...Object.fromEntries(universities.map((u, i) => [u.name, metrics.practicesAttestation[i]])) },
  ];

  return (
    <div className="tab-content">
      {/* Summary */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="value">{universities.length}</div>
          <div className="label">ВУЗів порівняно</div>
        </div>
        <div className="summary-card">
          <div className="value">{avg}</div>
          <div className="label">Середній обсяг обов'язкових (кр.)</div>
        </div>
        <div className="summary-card">
          <div className="value">{min}–{max}</div>
          <div className="label">Діапазон кредитів</div>
        </div>
      </div>
      <div className="summary-cards">
        {universities.map((u, i) => (
          <div key={u.id} className="summary-card">
            <div className="value" style={{ color: COLORS[i], fontSize: '2rem' }}>{disciplineCounts[i]}</div>
            <div className="label">Дисциплін {u.name}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Radar + Stacked Bar */}
      <div className="charts-grid">
        <div className="card">
          <h3>Порівняння за категоріями</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              {universities.map((u, i) => (
                <Radar
                  key={u.id}
                  name={u.name}
                  dataKey={u.name}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={u.isMain ? 0.3 : 0.05}
                  strokeWidth={u.isMain ? 3 : 1}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Обов'язкових кредитів по категоріях</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Загальні" stackId="a" fill="#6366f1" />
              <Bar dataKey="Математика" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="Програмування" stackId="a" fill="#0ea5e9" />
              <Bar dataKey="Кібербезпека" stackId="a" fill="#ef4444" />
              <Bar dataKey="Практики" stackId="a" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <h2 className="section-title">Теплова карта покриття (кредити)</h2>
      <div className="card" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table className="heatmap-table">
          <thead>
            <tr>
              <th>Категорія</th>
              {universities.map((u, i) => (
                <th key={u.id} style={{ color: COLORS[i] }}>{u.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, ri) => (
              <tr key={ri}>
                <td style={{ fontWeight: 500 }}>{row.category}</td>
                {row.values.map((v, vi) => {
                  const r = Math.round(239 + (99 - 239) * v.intensity);
                  const g = Math.round(68 + (102 - 68) * v.intensity);
                  const b = Math.round(68 + (241 - 68) * v.intensity);
                  return (
                    <td key={vi} style={{
                      background: `rgba(${r}, ${g}, ${b}, 0.3)`,
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    }}>
                      {v.value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Discipline Comparison Dropdown */}
      <h2 className="section-title">Порівняння дисциплін по кредитах</h2>
      <DisciplineCompare />

      {/* Pie Charts */}
      <h2 className="section-title">Розподіл кредитів по категоріях</h2>
      <div className="charts-grid" style={{ marginBottom: '2rem' }}>
        {pieData.map((pd, pi) => (
          <div key={pi} className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: COLORS[pi] }}>{pd.name}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pd.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={true}
                >
                  {pd.data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Unique Disciplines */}
      <h2 className="section-title">Унікальні дисципліни (є тільки в одному ВУЗі)</h2>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="unique-disciplines-grid">
          {universities.map((u, uIdx) => {
            const uniUniques = uniqueDisciplines.filter(d => d.uniIdx === uIdx);
            if (uniUniques.length === 0) return null;
            return (
              <div key={u.id} className="unique-uni-block">
                <h4 style={{ color: COLORS[uIdx], marginBottom: '0.5rem' }}>{u.name} ({uniUniques.length})</h4>
                {uniUniques.map((d, di) => (
                  <div key={di} className="unique-item">
                    {d.name} {d.credits && <span className="credit-badge">{d.credits}</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary text */}
      <h2 className="section-title">Порівняльний аналіз</h2>
      <div className="card" style={{ marginBottom: '2rem', lineHeight: 1.8, fontSize: '0.95rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Проведено порівняльний аналіз бакалаврської ОПП УжНУ "Кібербезпека та захист інформації"
          з програмами шести провідних ЗВО: Львівська Політехніка, КНУ ім. Шевченка, ХПІ, ОНПУ, ХНУ ім. Каразіна та ЧНУ.
          Усі 7 програм належать до спеціальності F5, мають загальний обсяг 240 кредитів ЄКТС
          (обов'язкових: 175–180 кр.). Назва ОПП УжНУ відповідає назві спеціальності F5
          "Кібербезпека та захист інформації", що є сучасним підходом.
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <h2 className="section-title">Позиціонування УжНУ</h2>
      <div className="sw-grid">
        <div>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--green)' }}>Сильні сторони</h3>
          <div className="sw-list">
            {strengths.map((s, i) => (
              <div key={i} className="sw-item strength">{s}</div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--red)' }}>Зони для обговорення</h3>
          <div className="sw-list">
            {weaknesses.map((w, i) => (
              <div key={i} className="sw-item weakness">{w}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Proposals */}
      <h2 className="section-title">Пропозиції</h2>
      <div className="sw-grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--accent-light)' }}>Короткострокові</h3>
          <div className="sw-list">
            <div className="sw-item" style={{ borderColor: 'var(--accent)', background: 'rgba(99,102,241,0.1)' }}>
              <strong>Посилити мовну підготовку</strong> — 6 кр. іноземної мови є найменшим показником.
              Середнє серед 7 ВУЗів — 11 кр. Розглянути збільшення хоча б до 9 кр.
            </div>
            <div className="sw-item" style={{ borderColor: 'var(--accent)', background: 'rgba(99,102,241,0.1)' }}>
              <strong>Актуалізувати силабуси профільних дисциплін</strong> — включити елементи ML/ШІ
              в існуючі курси (наприклад, в "Сучасні тренди в кібербезпеці", 3 кр.)
            </div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--orange)' }}>Довгострокові</h3>
          <div className="sw-list">
            <div className="sw-item" style={{ borderColor: 'var(--orange)', background: 'rgba(249,115,22,0.1)' }}>
              <strong>Додати дисципліну з ШІ в кібербезпеці</strong> (3–4 кр.) —
              ХПІ має "Основи ML для кібербезпеки" (4 кр.). Варіанти: "Методи машинного навчання
              в кібербезпеці", "Інтелектуальний аналіз кіберзагроз"
            </div>
            <div className="sw-item" style={{ borderColor: 'var(--orange)', background: 'rgba(249,115,22,0.1)' }}>
              <strong>Розглянути курс з розслідування інцидентів</strong> —
              є в ЛП (6 кр.) та КНУ ("Кіберпростір та протидія кіберзлочинності", 6 кр.),
              відсутній в УжНУ
            </div>
            <div className="sw-item" style={{ borderColor: 'var(--orange)', background: 'rgba(249,115,22,0.1)' }}>
              <strong>Збільшити обсяг вищої математики</strong> — 6 кр. проти 11–16 кр. в інших ВУЗах.
              Розглянути додавання дискретної математики (як в ЛП, 4 кр.)
            </div>
            <div className="sw-item" style={{ borderColor: 'var(--orange)', background: 'rgba(249,115,22,0.1)' }}>
              <strong>Додати сучасні тренди</strong> — безпека IoT, веббезпека, антивірусний захист
              (присутні в ХПІ, відсутні в УжНУ). Можливо як вибіркові компоненти
            </div>
          </div>
        </div>
      </div>

      {/* Uni Profiles */}
      <h2 className="section-title">Унікальні акценти ВУЗів</h2>
      <div className="profiles-grid">
        {uniFeatures.map((uf, i) => (
          <div key={i} className={`profile-card ${uf.isMain ? 'main' : ''}`}>
            <div className="uni-name">{uf.uni}</div>
            <div className="uni-feature">{uf.feature}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
