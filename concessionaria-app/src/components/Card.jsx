import React from 'react';
import { fmtBRL } from '../services/utils';

const Card = ({ title, icon, count, value, isTotal }) => (
  <div className={`stat-card ${isTotal ? 'stat-card--total' : ''}`}>
    <div className="stat-card__icon">{icon}</div>
    <div className="stat-card__content">
      <h3 className="stat-card__title">{title}</h3>
      <div className="stat-card__value">{typeof count === 'number' ? count : count}</div>
      <div className="stat-card__subtitle">{typeof value === 'number' ? fmtBRL(value) : value}</div>
    </div>
  </div>
);

export default Card;
