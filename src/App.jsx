import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ComparisonTable from './components/ComparisonTable';

const tabs = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'table', label: 'Таблиця порівняння' },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <>
      <nav className="nav">
        <div className="nav-logo">
          ОПП <span>F5</span>
        </div>
        <ul className="nav-tabs">
          {tabs.map(t => (
            <li key={t.id}>
              <button
                className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="hero">
        <h1>Порівняльний аналіз ОПП "Кібербезпека" (бакалавр)</h1>
        <p className="subtitle">Спеціальність F5 — 4 провідних ВУЗи України</p>
      </section>

      <div className="container">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'table' && <ComparisonTable />}
      </div>

      <footer className="footer">
        &copy; 2026 УжНУ — <a href="https://teib.info/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--accent-light)', textDecoration: 'none'}}>Кафедра твердотільної електроніки та інформаційної безпеки</a>
      </footer>
    </>
  );
}

export default App;
