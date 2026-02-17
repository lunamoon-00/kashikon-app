import React, { useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import foodCategories from './foodCategories';

const FridgePage = ({ fridge, setFridge }) => {
  const [selectedCategory, setSelectedCategory] = useState('肉類');

  const addToFridge = (item) => {
    if (!fridge.find(f => f.item === item)) {
      setFridge([...fridge, { item, amount: '', addedDate: new Date().toISOString() }]);
    }
  };

  const removeFromFridge = (item) => {
    setFridge(fridge.filter(f => f.item !== item));
  };

  const updateAmount = (item, amount) => {
    setFridge(fridge.map(f => f.item === item ? {...f, amount} : f));
  };

  const isInFridge = (item) => {
    return fridge.some(f => f.item === item);
  };

  return (
    <div className="p-6 space-y-6 pb-28">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #22d3ee, #3b82f6)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="4" y1="10" x2="20" y2="10"/>
            <line x1="7" y1="5" x2="7" y2="8"/>
            <line x1="7" y1="13" x2="7" y2="18"/>
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">冷蔵庫</h2>
          <p className="text-sm text-gray-500 mt-0.5">在庫 {fridge.length}個</p>
        </div>
      </div>

      {fridge.length > 0 && (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-cyan-900 flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-500" />
              登録済み
            </h3>
            <button
              onClick={() => setFridge([])}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              全て削除
            </button>
          </div>
          <div className="space-y-2">
            {fridge.map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-white/80 backdrop-blur rounded-xl border border-cyan-100 shadow-sm" style={{ overflow: 'hidden' }}>
                <span className="flex-1 font-medium text-gray-800" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.item}</span>
                <input
                  type="text"
                  value={f.amount}
                  onChange={(e) => updateAmount(f.item, e.target.value)}
                  placeholder="分量"
                  className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
                  style={{ fontSize: '16px', flexShrink: 0, width: '5rem' }}
                />
                <button
                  onClick={() => removeFromFridge(f.item)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  style={{ flexShrink: 0 }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-gray-100 p-5 rounded-3xl shadow-sm">
        <h3 className="font-bold mb-4 text-gray-800">食材を追加</h3>

        <div className="flex overflow-x-auto gap-2 mb-5 pb-2 scrollbar-hide">
          {Object.keys(foodCategories).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`kondate-category-btn ${selectedCategory === category ? 'selected' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="kondate-food-grid">
          {foodCategories[selectedCategory].map(food => (
            <button
              key={food}
              onClick={() => addToFridge(food)}
              disabled={isInFridge(food)}
              className="kondate-food-btn"
            >
              <span className="text-sm font-medium">{food}</span>
              {isInFridge(food) && (
                <span className="ml-2 text-xs text-green-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FridgePage;
