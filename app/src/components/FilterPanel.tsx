import type { Taxonomy } from '../types';
import type { Filters } from '../utils/filters';

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  taxonomy: Taxonomy;
}

const fieldClass = 'w-full rounded-lg border border-[#303030] bg-[#121212] px-3 py-2 text-sm text-[#f1f1f1] focus:border-[#1c62b9] focus:outline-none';

export function FilterPanel({ filters, onChange, taxonomy }: FilterPanelProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'area') {
      newFilters.category = 'all';
    }
    onChange(newFilters);
  };

  const selectedArea = taxonomy.areas.find((area) => area.id === filters.area);
  const categories = selectedArea?.categories || [];

  return (
    <div className="max-w-sm space-y-4 rounded-xl bg-[#212121] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-[#f1f1f1]">Filters</h2>
        <button
          type="button"
          onClick={() => onChange({
            ...filters,
            contentType: 'all',
            level: 'all',
            area: 'all',
            category: 'all',
            shelfLife: 'all',
            sortBy: 'featured',
          })}
          className="text-sm font-medium text-[#3ea6ff]"
        >
          Reset
        </button>
      </div>

      <label className="block text-sm text-[#aaaaaa]">
        Sort by
        <select
          value={filters.sortBy}
          onChange={(event) => updateFilter('sortBy', event.target.value)}
          className={`${fieldClass} mt-1`}
        >
          <option value="featured">Latest and most viewed</option>
          <option value="score">Highest rated</option>
          <option value="recent">Most recent</option>
          <option value="oldest">Oldest</option>
        </select>
      </label>

      <label className="block text-sm text-[#aaaaaa]">
        Content type
        <select
          value={filters.contentType}
          onChange={(event) => updateFilter('contentType', event.target.value)}
          className={`${fieldClass} mt-1`}
        >
          <option value="all">All types</option>
          <option value="talk">Talk</option>
          <option value="course">Course</option>
          <option value="tutorial">Tutorial</option>
          <option value="demo">Demo</option>
          <option value="interview">Interview</option>
          <option value="documentary">Documentary</option>
        </select>
      </label>

      <label className="block text-sm text-[#aaaaaa]">
        Level
        <select
          value={filters.level}
          onChange={(event) => updateFilter('level', event.target.value)}
          className={`${fieldClass} mt-1`}
        >
          <option value="all">All levels</option>
          <option value="intro">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </label>

      <label className="block text-sm text-[#aaaaaa]">
        Topic area
        <select
          value={filters.area}
          onChange={(event) => updateFilter('area', event.target.value)}
          className={`${fieldClass} mt-1`}
        >
          <option value="all">All areas</option>
          {taxonomy.areas.map((area) => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>
      </label>

      {categories.length > 0 && (
        <label className="block text-sm text-[#aaaaaa]">
          Category
          <select
            value={filters.category}
            onChange={(event) => updateFilter('category', event.target.value)}
            className={`${fieldClass} mt-1`}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
      )}

      <label className="block text-sm text-[#aaaaaa]">
        Shelf life
        <select
          value={filters.shelfLife}
          onChange={(event) => updateFilter('shelfLife', event.target.value)}
          className={`${fieldClass} mt-1`}
        >
          <option value="all">All videos</option>
          <option value="evergreen">Evergreen</option>
          <option value="news">News</option>
        </select>
      </label>
    </div>
  );
}
