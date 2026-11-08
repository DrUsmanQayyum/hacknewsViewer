import type { Taxonomy } from '../types';
import type { Filters } from '../utils/filters';

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  taxonomy: Taxonomy;
}

export function FilterPanel({ filters, onChange, taxonomy }: FilterPanelProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    // Reset category when area changes
    if (key === 'area') {
      newFilters.category = 'all';
    }
    onChange(newFilters);
  };

  const selectedArea = taxonomy.areas.find(a => a.id === filters.area);
  const categories = selectedArea?.categories || [];

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="score">Highest Rated</option>
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Content Type
        </label>
        <select
          value={filters.contentType}
          onChange={(e) => updateFilter('contentType', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="talk">Talk</option>
          <option value="course">Course</option>
          <option value="tutorial">Tutorial</option>
          <option value="demo">Demo</option>
          <option value="interview">Interview</option>
          <option value="documentary">Documentary</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Level
        </label>
        <select
          value={filters.level}
          onChange={(e) => updateFilter('level', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Levels</option>
          <option value="intro">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Topic Area
        </label>
        <select
          value={filters.area}
          onChange={(e) => updateFilter('area', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Areas</option>
          {taxonomy.areas.map(area => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>
      </div>

      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Shelf Life
        </label>
        <select
          value={filters.shelfLife}
          onChange={(e) => updateFilter('shelfLife', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Videos</option>
          <option value="evergreen">Evergreen Only</option>
          <option value="news">News/Timely</option>
        </select>
      </div>
    </div>
  );
}
