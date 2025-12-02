import React from 'react';

const ThSort = ({ label, colKey, sortConfig, onSort }) => (
  <th className="sortable-th" onClick={() => onSort(colKey)}>
    <span className="sort-label">{label}</span>
    <span className="sort-icon">
      {sortConfig.key === colKey ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
    </span>
  </th>
);

export default ThSort;
