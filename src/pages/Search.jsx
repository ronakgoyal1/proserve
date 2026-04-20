import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, SlidersHorizontal, X, Check, ArrowUpDown, Loader2, AlertCircle
} from 'lucide-react';
import ProfessionalCard from '../components/ProfessionalCard';
import { cities } from '../data/mockData';
import { dbService } from '../lib/dbService';
import './Search.css';

const experienceRanges = [
  { label: 'Any Experience', value: '' },
  { label: '0-5 years', value: '0-5' },
  { label: '5-10 years', value: '5-10' },
  { label: '10-15 years', value: '10-15' },
  { label: '15+ years', value: '15+' }
];

const ratingOptions = [
  { label: '4.5+ Stars', value: 4.5 },
  { label: '4.0+ Stars', value: 4.0 },
  { label: '3.5+ Stars', value: 3.5 }
];

const languages = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [experienceFilter, setExperienceFilter] = useState('');
  const [languageFilters, setLanguageFilters] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Data fetching state
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadProfessionals() {
      try {
        setIsLoading(true);
        const data = await dbService.getProfessionals();
        if (mounted) {
          setProfessionals(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load professionals:', err);
        if (mounted) setError('We are having trouble loading professionals right now. Please try again later.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadProfessionals();
    return () => { mounted = false; };
  }, []);

  const toggleLanguage = (lang) => {
    setLanguageFilters(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const filteredPros = useMemo(() => {
    let results = [...professionals];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.services.some(s => s.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (cityFilter) {
      results = results.filter(p => p.city === cityFilter);
    }

    if (categoryFilter) {
      results = results.filter(p => p.category === categoryFilter);
    }

    if (ratingFilter) {
      results = results.filter(p => p.rating >= ratingFilter);
    }

    if (experienceFilter) {
      results = results.filter(p => {
        if (experienceFilter === '0-5') return p.experience <= 5;
        if (experienceFilter === '5-10') return p.experience > 5 && p.experience <= 10;
        if (experienceFilter === '10-15') return p.experience > 10 && p.experience <= 15;
        if (experienceFilter === '15+') return p.experience > 15;
        return true;
      });
    }

    if (languageFilters.length > 0) {
      results = results.filter(p =>
        languageFilters.some(lang => p.languages.includes(lang))
      );
    }

    results.sort((a, b) => {
      if (sortBy === 'relevance') {
        const getScore = (pro) => {
          let score = 0;
          if (pro.verification?.status === 'verified') score += 50;
          if (pro.featured) score += 10;
          score += pro.rating * 5;
          score += Math.min(pro.reviews * 0.1, 10);
          return score;
        };
        return getScore(b) - getScore(a);
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.startingPrice - b.startingPrice;
      if (sortBy === 'price-high') return b.startingPrice - a.startingPrice;
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0;
    });

    return results;
  }, [search, cityFilter, categoryFilter, ratingFilter, experienceFilter, languageFilters, sortBy]);

  const activeFilterCount = [categoryFilter, cityFilter, ratingFilter, experienceFilter, ...languageFilters].filter(Boolean).length;

  const clearFilters = () => {
    setCategoryFilter('');
    setCityFilter('');
    setRatingFilter(0);
    setExperienceFilter('');
    setLanguageFilters([]);
    setSearch('');
  };

  const renderFilters = () => (
    <>
      {/* Category */}
      <div className="filter-section">
        <h3>Category</h3>
        <div className="filter-options">
          {['', 'CA', 'CMA'].map(cat => (
            <div
              key={cat}
              className={`filter-option ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              <div className="filter-checkbox">
                {categoryFilter === cat && <Check size={12} />}
              </div>
              {cat || 'All Categories'}
            </div>
          ))}
        </div>
      </div>

      {/* City */}
      <div className="filter-section">
        <h3>City</h3>
        <select
          className="filter-select"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        >
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Rating */}
      <div className="filter-section">
        <h3>Minimum Rating</h3>
        <div className="filter-options">
          {ratingOptions.map(r => (
            <div
              key={r.value}
              className={`filter-option ${ratingFilter === r.value ? 'active' : ''}`}
              onClick={() => setRatingFilter(ratingFilter === r.value ? 0 : r.value)}
            >
              <div className="filter-checkbox">
                {ratingFilter === r.value && <Check size={12} />}
              </div>
              {r.label}
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="filter-section">
        <h3>Experience</h3>
        <select
          className="filter-select"
          value={experienceFilter}
          onChange={(e) => setExperienceFilter(e.target.value)}
        >
          {experienceRanges.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div className="filter-section">
        <h3>Language</h3>
        <div className="filter-options">
          {languages.map(lang => (
            <div
              key={lang}
              className={`filter-option ${languageFilters.includes(lang) ? 'active' : ''}`}
              onClick={() => toggleLanguage(lang)}
            >
              <div className="filter-checkbox">
                {languageFilters.includes(lang) && <Check size={12} />}
              </div>
              {lang}
            </div>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ width: '100%' }}>
          Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <main className="search-page" id="search-page">
      {/* Search Header */}
      <section className="search-hero">
        <div className="container">
          <h1>Find the Right Expert</h1>
          <div className="search-top-bar">
            <div className="search-top-input">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name, service, or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="search-top-input" style={{ maxWidth: 200 }}>
              <MapPin size={18} />
              <select
                style={{ width: '100%', background: 'none', border: 'none', color: 'var(--color-white)', cursor: 'pointer' }}
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="" style={{ color: 'var(--color-gray-900)' }}>All Cities</option>
                {cities.map(c => <option key={c} value={c} style={{ color: 'var(--color-gray-900)' }}>{c}</option>)}
              </select>
            </div>
            <button className="btn btn-primary">
              <Search size={16} /> Search
            </button>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Mobile filter toggle */}
        <button
          className="mobile-filter-toggle"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal size={16} />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>

        <div className="search-layout">
          {/* Sidebar Filters */}
          <aside className={`search-sidebar ${mobileFiltersOpen ? 'mobile-open' : ''}`} id="search-filters">
            <button
              className="mobile-filter-close"
              onClick={() => setMobileFiltersOpen(false)}
              style={{ display: mobileFiltersOpen ? 'flex' : 'none' }}
            >
              <X size={20} />
            </button>
            {renderFilters()}
          </aside>

          {/* Results */}
          <section className="search-results" id="search-results">
            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="active-filters">
                {categoryFilter && (
                  <span className="active-filter-tag" onClick={() => setCategoryFilter('')}>
                    {categoryFilter} <X size={12} />
                  </span>
                )}
                {cityFilter && (
                  <span className="active-filter-tag" onClick={() => setCityFilter('')}>
                    {cityFilter} <X size={12} />
                  </span>
                )}
                {ratingFilter > 0 && (
                  <span className="active-filter-tag" onClick={() => setRatingFilter(0)}>
                    {ratingFilter}+ Stars <X size={12} />
                  </span>
                )}
                {experienceFilter && (
                  <span className="active-filter-tag" onClick={() => setExperienceFilter('')}>
                    {experienceFilter} yrs <X size={12} />
                  </span>
                )}
                {languageFilters.map(lang => (
                  <span key={lang} className="active-filter-tag" onClick={() => toggleLanguage(lang)}>
                    {lang} <X size={12} />
                  </span>
                ))}
              </div>
            )}

            <div className="search-results-header">
              <span className="results-count">
                Showing <strong>{filteredPros.length}</strong> professional{filteredPros.length !== 1 ? 's' : ''}
              </span>
              <div className="sort-select">
                <ArrowUpDown size={14} />
                <span>Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="relevance">Top Match</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>
            </div>

            <div className="search-results-grid">
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
                  <Loader2 size={40} className="spin" style={{ color: 'var(--color-primary)' }} />
                  <p style={{ marginTop: '1rem', color: 'var(--color-gray-500)' }}>Loading professionals...</p>
                </div>
              ) : error ? (
                <div className="search-no-results" style={{ gridColumn: '1 / -1', border: '1px solid var(--color-error)' }}>
                  <AlertCircle size={48} style={{ color: 'var(--color-error)', margin: '0 auto var(--space-4)' }} />
                  <h3 style={{ color: 'var(--color-error)' }}>Error Loading Data</h3>
                  <p>{error}</p>
                </div>
              ) : filteredPros.length > 0 ? (
                filteredPros.map(pro => (
                  <ProfessionalCard key={pro.id} professional={pro} />
                ))
              ) : (
                <div className="search-no-results">
                  <Search size={48} style={{ color: 'var(--color-gray-300)', margin: '0 auto var(--space-4)' }} />
                  <h3>No professionals found</h3>
                  <p>Try adjusting your filters or search terms</p>
                  <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: 'var(--space-4)' }}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileFiltersOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 997
          }}
          onClick={() => setMobileFiltersOpen(false)}
        />
      )}
    </main>
  );
}
