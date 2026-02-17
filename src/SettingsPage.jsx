import React, { useState } from 'react';
import { Check, X, Settings } from 'lucide-react';
import foodCategories from './foodCategories';

const SettingsPage = React.memo(({ preferences, setPreferences, onShowManual, selectedCategory, setSelectedCategory, preferenceMode, setPreferenceMode }) => {
  const [budgetInput, setBudgetInput] = useState(null);

  const allergens = [
    '卵', '乳', '小麦', 'そば', '落花生', 'えび', 'かに',
    '大豆', '鶏肉', '豚肉', '牛肉', 'さけ', 'さば', 'いか', 'いくら',
    'オレンジ', 'キウイ', 'バナナ', 'もも', 'りんご', 'くるみ', 'ゼラチン'
  ];

  const toggleFood = (food) => {
    setPreferences(prev => {
      const key = preferenceMode === 'likes' ? 'likes' : preferenceMode === 'dislikes' ? 'dislikes' : 'allergies';
      const list = prev[key];
      if (list.includes(food)) {
        return { ...prev, [key]: list.filter(f => f !== food) };
      } else {
        return { ...prev, [key]: [...list, food] };
      }
    });
  };

  const isSelected = (food) => {
    if (preferenceMode === 'likes') return preferences.likes.includes(food);
    if (preferenceMode === 'dislikes') return preferences.dislikes.includes(food);
    return preferences.allergies.includes(food);
  };

  const removeItem = (key, idx) => {
    setPreferences(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="p-6 space-y-6 pb-28">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            <Settings size={28} color="white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">設定</h2>
        </div>
        {onShowManual && (
          <button
            onClick={onShowManual}
            className="px-4 py-2 rounded-xl border-2 border-purple-300 text-purple-700 font-semibold text-sm hover:bg-purple-50 transition-colors"
          >
            使い方を見る
          </button>
        )}
      </div>

      <div className="bg-white border-2 border-gray-100 p-5 rounded-3xl shadow-sm">
        <label className="block text-base font-bold mb-3 text-gray-800">何人分？</label>
        <input
          type="number"
          value={preferences.servings}
          onChange={(e) => setPreferences(prev => ({...prev, servings: Math.min(10, Math.max(1, parseInt(e.target.value) || 1))}))}
          className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold"
          style={{ fontSize: '16px' }}
          min="1"
          max="10"
        />
      </div>

      <div className="bg-white border-2 border-gray-100 p-5 rounded-3xl shadow-sm">
        <label className="block text-base font-bold mb-3 text-gray-800">月の食費予算（円）</label>
        <input
          type="number"
          inputMode="numeric"
          value={budgetInput !== null ? budgetInput : (preferences.monthlyBudget === 0 ? '' : preferences.monthlyBudget)}
          onChange={(e) => setBudgetInput(e.target.value)}
          onFocus={(e) => {
            setBudgetInput(preferences.monthlyBudget === 0 ? '' : String(preferences.monthlyBudget));
            e.target.select();
          }}
          onBlur={() => {
            const num = budgetInput === '' || budgetInput === null ? 0 : parseInt(String(budgetInput).replace(/\D/g, ''), 10) || 0;
            setPreferences(prev => ({...prev, monthlyBudget: num}));
            setBudgetInput(null);
          }}
          placeholder="例: 50000"
          className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold"
          style={{ fontSize: '16px' }}
        />
      </div>

      <div className="bg-white border-2 border-gray-100 p-5 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold mb-1 text-gray-800">食生活モード</h3>
        <p className="text-sm text-gray-500 mb-4">目指したい食生活に合わせて献立を提案します</p>
        <div className="space-y-3">
          {[
            { value: 'balanced', label: 'バランス型', icon: '⚖️', desc: '定番とおしゃれな料理をバランスよく' },
            { value: 'diet', label: 'ダイエット', icon: '🥗', desc: '低カロリー・高タンパク質中心' },
            { value: 'muscle', label: '筋トレ', icon: '💪', desc: '高タンパク質で筋肉をサポート' },
            { value: 'healthy', label: '健康志向', icon: '🌱', desc: '野菜多め、栄養バランス重視' },
            { value: 'family', label: 'ファミリー', icon: '👨‍👩‍👧‍👦', desc: '子供も喜ぶ定番料理中心' }
          ].map(mode => (
            <button
              key={mode.value}
              onClick={() => setPreferences(prev => ({...prev, lifestyleMode: mode.value}))}
              className={`kondate-mode-card ${preferences.lifestyleMode === mode.value ? 'selected' : ''}`}
            >
              <span className="mode-icon">{mode.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-bold text-gray-800">{mode.label}</div>
                <div className="text-sm text-gray-500 mt-0.5">{mode.desc}</div>
              </div>
              {preferences.lifestyleMode === mode.value && (
                <Check color="#9333ea" size={28} strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-gray-100 p-5 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-800">食材の設定</h3>
        <p className="text-sm text-gray-500 mb-4">好き・苦手・アレルギーを設定して献立をパーソナライズ</p>

        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setPreferenceMode('likes')}
            className={`kondate-pref-tab ${preferenceMode === 'likes' ? 'active' : ''}`}
            style={preferenceMode === 'likes' ? { background: 'linear-gradient(90deg, #4ade80, #10b981)', color: 'white' } : {}}
          >
            <span>好き</span>
            <span className="tab-count">{preferences.likes.length}件</span>
          </button>
          <button
            onClick={() => setPreferenceMode('dislikes')}
            className={`kondate-pref-tab ${preferenceMode === 'dislikes' ? 'active' : ''}`}
            style={preferenceMode === 'dislikes' ? { background: 'linear-gradient(90deg, #fb7185, #ec4899)', color: 'white' } : {}}
          >
            <span>苦手</span>
            <span className="tab-count">{preferences.dislikes.length}件</span>
          </button>
          <button
            onClick={() => setPreferenceMode('allergies')}
            className={`kondate-pref-tab ${preferenceMode === 'allergies' ? 'active' : ''}`}
            style={preferenceMode === 'allergies' ? { background: 'linear-gradient(90deg, #fb923c, #ef4444)', color: 'white' } : {}}
          >
            <span>除外</span>
            <span className="tab-count">{preferences.allergies.length}件</span>
          </button>
        </div>

        {preferenceMode === 'allergies' ? (
          <>
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl mb-4">
              <p className="text-sm text-orange-800 font-medium">これらの食材を含む献立は提案されません</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {allergens.map(food => (
                <button
                  key={food}
                  type="button"
                  onClick={() => toggleFood(food)}
                  className={`kondate-food-card ${isSelected(food) ? 'selected allergies' : ''}`}
                >
                  <span className="flex-1 font-medium text-gray-800 text-left">{food}</span>
                  {isSelected(food) && <Check color="#f97316" size={20} />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex overflow-x-auto gap-2 mb-5 pb-2 scrollbar-hide">
              {Object.keys(foodCategories).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`kondate-category-btn ${selectedCategory === category ? 'selected' : ''}`}
                  style={selectedCategory === category
                    ? (preferenceMode === 'likes' ? { background: 'linear-gradient(90deg, #4ade80, #10b981)', color: 'white' } : { background: 'linear-gradient(90deg, #fb7185, #ec4899)', color: 'white' })
                    : {}}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {foodCategories[selectedCategory].map(food => (
                <button
                  key={food}
                  type="button"
                  onClick={() => toggleFood(food)}
                  className={`kondate-food-card ${isSelected(food) ? `selected ${preferenceMode}` : ''}`}
                >
                  <span className="flex-1 font-medium text-gray-800 text-left">{food}</span>
                  {isSelected(food) && (
                    <Check color={preferenceMode === 'likes' ? '#22c55e' : '#ef4444'} size={20} />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {(preferences.likes.length > 0 || preferences.dislikes.length > 0 || preferences.allergies.length > 0) && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-5 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-purple-900">選択中</h3>

          {preferences.likes.length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-green-700 font-medium mb-2">好きな食材 ({preferences.likes.length})</div>
              <div className="flex flex-wrap gap-2">
                {preferences.likes.map((item, i) => (
                  <span key={i} className="bg-white border-2 border-green-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-sm">
                    {item}
                    <X
                      size={14}
                      className="cursor-pointer text-green-600 hover:text-green-800"
                      onClick={() => removeItem('likes', i)}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          {preferences.dislikes.length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-red-700 font-medium mb-2">苦手な食材 ({preferences.dislikes.length})</div>
              <div className="flex flex-wrap gap-2">
                {preferences.dislikes.map((item, i) => (
                  <span key={i} className="bg-white border-2 border-red-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-sm">
                    {item}
                    <X
                      size={14}
                      className="cursor-pointer text-red-600 hover:text-red-800"
                      onClick={() => removeItem('dislikes', i)}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          {preferences.allergies.length > 0 && (
            <div>
              <div className="text-sm text-orange-700 font-medium mb-2">アレルギー除外 ({preferences.allergies.length})</div>
              <div className="flex flex-wrap gap-2">
                {preferences.allergies.map((item, i) => (
                  <span key={i} className="bg-white border-2 border-orange-400 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-sm">
                    {item}
                    <X
                      size={14}
                      className="cursor-pointer text-orange-600 hover:text-orange-800"
                      onClick={() => removeItem('allergies', i)}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default SettingsPage;
