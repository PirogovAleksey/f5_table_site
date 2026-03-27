import { useState, useMemo, useCallback, Fragment } from 'react';
import { universities, categories } from '../data/universities';
import * as XLSX from 'xlsx';

export default function ComparisonTable() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [visibleUnis, setVisibleUnis] = useState(() =>
    universities.map(() => true)
  );

  const toggleUni = useCallback((index) => {
    setVisibleUnis(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const visibleIndices = useMemo(
    () => universities.map((_, i) => i).filter(i => visibleUnis[i]),
    [visibleUnis]
  );

  const filtered = useMemo(() => {
    return categories
      .map((cat, catIdx) => ({
        ...cat,
        catIdx,
        rows: cat.rows.filter(row => {
          if (filter !== 'all' && String(catIdx) !== filter) return false;
          if (!search) return true;
          const q = search.toLowerCase();
          return row.disciplines.some(d => d && d.name.toLowerCase().includes(q));
        })
      }))
      .filter(cat => cat.rows.length > 0);
  }, [filter, search]);

  const getCreditClass = (credits, row) => {
    if (credits === null || credits === undefined) return '';
    const allCredits = row.disciplines.filter(d => d && d.credits).map(d => d.credits);
    if (allCredits.length < 2) return '';
    const max = Math.max(...allCredits);
    const min = Math.min(...allCredits);
    if (credits === max && max !== min) return 'high';
    if (credits === min && max !== min) return 'low';
    return '';
  };

  const isGapRow = (row) => {
    const uzhnu = row.disciplines[0];
    if (uzhnu !== null) return false;
    return row.disciplines.some((d, i) => i !== 0 && d !== null);
  };

  const getCategorySubtotals = (cat) => {
    return universities.map((_, uIdx) => {
      let total = 0;
      cat.rows.forEach(row => {
        const d = row.disciplines[uIdx];
        if (d && d.credits) total += d.credits;
      });
      return total;
    });
  };

  const getCategoryDisciplineCount = (cat) => {
    return universities.map((_, uIdx) => {
      let count = 0;
      cat.rows.forEach(row => {
        if (row.disciplines[uIdx] !== null) count++;
      });
      return count;
    });
  };

  const buildCategoryLabel = (cat) => {
    const counts = getCategoryDisciplineCount(cat);
    const parts = visibleIndices
      .map(i => `${universities[i].name}: ${counts[i]}`)
      .join(', ');
    return `${cat.name} (${parts})`;
  };

  const exportToExcel = useCallback(() => {
    const wsData = [];

    // Header row
    const header = ['#'];
    universities.forEach(u => header.push(u.name));
    wsData.push(header);

    categories.forEach(cat => {
      const subtotals = getCategorySubtotals(cat);
      const counts = getCategoryDisciplineCount(cat);

      // Category header
      const catCountStr = universities.map((u, i) => `${u.name}: ${counts[i]}`).join(', ');
      const catRow = [`${cat.name} (${catCountStr})`];
      for (let i = 0; i < universities.length; i++) catRow.push('');
      wsData.push(catRow);

      // Discipline rows
      cat.rows.forEach(row => {
        const r = [row.code || ''];
        row.disciplines.forEach(d => {
          if (d) {
            let cell = d.name;
            if (d.credits !== null && d.credits !== undefined) cell += ` [${d.credits} кр.]`;
            if (d.control) cell += ` (${d.control})`;
            r.push(cell);
          } else {
            r.push('');
          }
        });
        wsData.push(r);
      });

      // Subtotal row
      const subRow = ['Разом'];
      subtotals.forEach(s => subRow.push(s > 0 ? s : ''));
      wsData.push(subRow);

      // Empty separator
      wsData.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },
      ...universities.map(() => ({ wch: 40 }))
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Порівняння');
    XLSX.writeFile(wb, 'Порівняння_ОПП_Кібербезпека.xlsx');
  }, []);

  return (
    <div className="tab-content">
      {/* University toggle checkboxes */}
      <div className="uni-toggles">
        {universities.map((u, i) => (
          <label key={u.id} className={`uni-toggle-label${u.isMain ? ' main' : ''}`}>
            <input
              type="checkbox"
              checked={visibleUnis[i]}
              onChange={() => toggleUni(i)}
            />
            <span>{u.name}</span>
          </label>
        ))}
      </div>

      <div className="table-controls">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Усі категорії</option>
          {categories.map((c, i) => (
            <option key={i} value={String(i)}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Пошук дисципліни..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {/* <button className="export-btn" onClick={exportToExcel}>
          Експорт в Excel
        </button> */}
      </div>

      <div className="table-wrapper">
        <table className="comp-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ verticalAlign: 'bottom', width: 50 }}>#</th>
              {visibleIndices.map(i => (
                <th key={universities[i].id} colSpan={3} className={universities[i].isMain ? 'uzhnu-col' : ''} style={{ textAlign: 'center' }}>
                  {universities[i].name}
                  <br />
                  <span style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.7 }}>
                    {universities[i].mandatory} кр.
                  </span>
                </th>
              ))}
            </tr>
            <tr>
              {visibleIndices.map(i => (
                <Fragment key={`sub-${i}`}>
                  <th className={universities[i].isMain ? 'uzhnu-col' : ''} style={{ fontSize: '0.75rem', minWidth: 140 }}>Дисципліна</th>
                  <th className={universities[i].isMain ? 'uzhnu-col' : ''} style={{ fontSize: '0.75rem', width: 35, textAlign: 'center' }}>Кр.</th>
                  <th className={universities[i].isMain ? 'uzhnu-col' : ''} style={{ fontSize: '0.75rem', width: 45, textAlign: 'center' }}>Контр.</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(cat => {
              const subtotals = getCategorySubtotals(cat);
              return (
                <Fragment key={`cat-${cat.catIdx}`}>
                  <tr className={`category-row cat-${cat.catIdx}`}>
                    <td colSpan={visibleIndices.length * 3 + 1}>
                      {buildCategoryLabel(cat)}
                    </td>
                  </tr>
                  {cat.rows.map((row, rowIdx) => {
                    const gap = isGapRow(row);
                    return (
                      <tr
                        key={`${cat.catIdx}-${rowIdx}`}
                        className={gap ? 'gap-row' : ''}
                      >
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {row.code || ''}
                        </td>
                        {visibleIndices.map(i => {
                          const d = row.disciplines[i];
                          const cls = universities[i]?.isMain ? 'uzhnu-cell' : '';
                          return (
                            <Fragment key={i}>
                              <td className={d ? cls : 'empty'}>{d ? d.name : ''}</td>
                              <td className={d ? `${cls} credit-col ${getCreditClass(d.credits, row)}` : 'empty'} style={{ textAlign: 'center' }}>{d && d.credits != null ? d.credits : ''}</td>
                              <td className={d ? `${cls} control-col` : 'empty'} style={{ textAlign: 'center' }}>{d ? d.control : ''}</td>
                            </Fragment>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr className="subtotal-row">
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>Разом</td>
                    {visibleIndices.map(i => (
                      <Fragment key={`sub-${i}`}>
                        <td className={universities[i]?.isMain ? 'uzhnu-cell' : ''}></td>
                        <td className={universities[i]?.isMain ? 'uzhnu-cell' : ''} style={{ textAlign: 'center', fontWeight: 700 }}>{subtotals[i] > 0 ? subtotals[i] : '—'}</td>
                        <td className={universities[i]?.isMain ? 'uzhnu-cell' : ''}></td>
                      </Fragment>
                    ))}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

