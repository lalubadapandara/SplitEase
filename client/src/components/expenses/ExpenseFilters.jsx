import React from 'react'
import { CATEGORY_CONFIG } from '../../utils/constants'

export default function ExpenseFilters({ search, onSearch, category, onCategory }) {
  return (
    <div className="expense-filters">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search expenses…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <select value={category} onChange={e => onCategory(e.target.value)}>
        <option value="">All Categories</option>
        {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
          <option key={k} value={k}>{v.icon} {v.label}</option>
        ))}
      </select>
    </div>
  )
}
