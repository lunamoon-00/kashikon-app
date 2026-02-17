import React, { useState, useCallback } from 'react';
import { Camera, ShoppingCart, Calendar, Settings, AlertTriangle, Plus, Trash2, Check, X, ChefHat, Sparkles, DollarSign } from 'lucide-react';
import FridgePage from './FridgePage';
import SettingsPage from './SettingsPage';

const KondateApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [preferences, setPreferences] = useState({
    servings: 4,
    monthlyBudget: 50000,
    likes: [],
    dislikes: [],
    allergies: [], // アレルギー設定を追加
    lifestyleMode: 'balanced' // 食生活モード: balanced, diet, muscle, healthy, family
  });
  const [flyers, setFlyers] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [menuSuggestions, setMenuSuggestions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fridge, setFridge] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState({
    breakfast: null,
    lunch: null,
    dinner: null
  });
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const handleShowManual = useCallback(() => setShowManual(true), []);
  const [fridgeCategory, setFridgeCategory] = useState('肉類');
  const [settingsCategory, setSettingsCategory] = useState('肉類');
  const [preferenceMode, setPreferenceMode] = useState('likes');

  // レシピサイト一覧
  const recipeSites = [
    { name: 'クックパッド', url: 'https://cookpad.com/search/', icon: '🍳' },
    { name: 'クラシル', url: 'https://www.kurashiru.com/search?query=', icon: '📱' },
    { name: 'デリッシュキッチン', url: 'https://delishkitchen.tv/search?q=', icon: '🎬' },
    { name: '楽天レシピ', url: 'https://recipe.rakuten.co.jp/search/', icon: '🛒' },
    { name: 'AJINOMOTO Park', url: 'https://park.ajinomoto.co.jp/recipe/search/?search_word=', icon: '🏢' },
    { name: 'キッコーマン', url: 'https://www.kikkoman.co.jp/homecook/search/result.html?keyword=', icon: '🥢' }
  ];

  const openRecipeModal = (recipeName) => {
    setSelectedRecipe(recipeName);
    setShowRecipeModal(true);
  };

  const goToRecipeSite = (site) => {
    const query = encodeURIComponent(selectedRecipe);
    window.open(site.url + query, '_blank', 'noopener,noreferrer');
    setShowRecipeModal(false);
  };

  // 月間支出の計算
  const monthlyTotal = expenses
    .filter(e => {
      const date = new Date(e.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const remainingBudget = preferences.monthlyBudget - monthlyTotal;
  const budgetPercentage = (monthlyTotal / preferences.monthlyBudget) * 100;

  // AI献立提案
  const generateMenu = async (useFridge = false) => {
    setIsLoading(true);
    try {
      const fridgePrompt = useFridge && fridge.length > 0 
        ? `\n\n【重要】冷蔵庫に以下の食材があります。これらを優先的に使って献立を考えてください：\n${fridge.map(f => `- ${f.item}（${f.amount || '適量'}）`).join('\n')}\n\nこれらの食材を使い切るように献立を組んでください。`
        : '';

      const allergyPrompt = preferences.allergies.length > 0
        ? `\n\n【アレルギー情報】以下のアレルギー物質を含む食材は絶対に使用しないでください：\n${preferences.allergies.join(', ')}`
        : '';

      // 食生活モードに応じた指示
      const lifestyleModePrompts = {
        balanced: '定番料理とおしゃれな料理をバランスよく混ぜてください。カロリーは通常範囲（朝食300-450kcal、昼食500-700kcal、夕食600-800kcal）。',
        diet: 'ダイエット向けの低カロリー・高タンパク質な献立を中心に。カロリーは控えめ（朝食250-350kcal、昼食400-550kcal、夕食450-650kcal）。油を控え、野菜を多めに。',
        muscle: '筋トレ向けの高タンパク質な献立を中心に。鶏むね肉、卵、魚、豆腐などタンパク質豊富な食材を積極的に。カロリーは高め（朝食400-500kcal、昼食600-800kcal、夕食700-900kcal）。',
        healthy: '健康志向の献立。野菜多め、バランスの良い栄養、発酵食品や食物繊維を意識。カロリーは適度（朝食300-400kcal、昼食500-650kcal、夕食550-750kcal）。',
        family: '子供も喜ぶファミリー向けの定番料理中心。食べやすく、親しみやすいメニュー。カロリーは通常範囲。'
      };

      const lifestylePrompt = `\n\n【食生活モード】${lifestyleModePrompts[preferences.lifestyleMode] || lifestyleModePrompts.balanced}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2500,
          messages: [
            {
              role: "user",
              content: `以下の条件で様々な献立候補を提案してください：
- 人数: ${preferences.servings}人分
- 月間予算: ${preferences.monthlyBudget}円（残り: ${remainingBudget}円）
- 好きな食材: ${preferences.likes.join(', ') || 'なし'}
- 嫌いな食材: ${preferences.dislikes.join(', ') || 'なし（これらの食材は絶対に使わないでください）'}${allergyPrompt}${fridgePrompt}${lifestylePrompt}

朝食、昼食、夕食それぞれに3〜4種類の候補を提案してください。ユーザーが好きな献立を選べるようにします。

【重要な提案ルール】
- 定番料理（親子丼、生姜焼き、ハンバーグなど）とおしゃれな料理（ガパオライス、アヒージョなど）をバランスよく
- 和洋中エスニックをバランスよく混ぜる
- 具体的な調理法や味付けを料理名に含める
- 食生活モードに応じた栄養バランスとカロリーを意識

各献立には必ずカロリー情報を含めてください（1人前あたりのカロリー）。

JSONフォーマットで、以下の構造で返してください（JSON以外は含めないでください）:
{
  "breakfast": [
    {
      "id": "b1",
      "name": "トースト、目玉焼き、サラダ",
      "ingredients": ["食パン", "卵", "レタス", "トマト"],
      "estimatedCost": 300,
      "cookingTime": "10分",
      "calories": 350,
      "usedFridgeItems": []
    }
  ],
  "lunch": [
    {
      "id": "l1",
      "name": "ミートソースパスタ",
      "ingredients": ["パスタ", "豚ひき肉", "トマト缶", "玉ねぎ"],
      "estimatedCost": 400,
      "cookingTime": "20分",
      "calories": 650,
      "usedFridgeItems": ["玉ねぎ"]
    }
  ],
  "dinner": [
    {
      "id": "d1",
      "name": "カレーライス",
      "ingredients": ["米", "豚肉", "人参", "じゃがいも", "玉ねぎ", "カレールー"],
      "estimatedCost": 600,
      "cookingTime": "40分",
      "calories": 800,
      "usedFridgeItems": ["人参", "じゃがいも"]
    }
  ]
}`
            }
          ],
        })
      });

      const data = await response.json();
      const text = data.content.find(c => c.type === "text")?.text || "";
      const cleanText = text.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleanText);
      
      setMenuSuggestions(result);
    } catch (error) {
      console.error("献立生成エラー:", error);
      const sampleData = {
        breakfast: [
          { id: "b1", name: "納豆ご飯、味噌汁", ingredients: ["米", "納豆", "味噌", "わかめ", "豆腐"], estimatedCost: 250, cookingTime: "10分", calories: 380, usedFridgeItems: [] },
          { id: "b2", name: "アボカドトースト、スクランブルエッグ", ingredients: ["食パン", "卵", "アボカド", "トマト"], estimatedCost: 450, cookingTime: "10分", calories: 380, usedFridgeItems: [] },
          { id: "b3", name: "ギリシャヨーグルトボウル", ingredients: ["ギリシャヨーグルト", "バナナ", "ブルーベリー", "グラノーラ", "はちみつ"], estimatedCost: 350, cookingTime: "5分", calories: 320, usedFridgeItems: [] },
          { id: "b4", name: "目玉焼きトースト、サラダ", ingredients: ["食パン", "卵", "レタス", "トマト", "バター"], estimatedCost: 300, cookingTime: "10分", calories: 350, usedFridgeItems: [] }
        ],
        lunch: [
          { id: "l1", name: "カルボナーラ", ingredients: ["パスタ", "ベーコン", "卵", "パルメザンチーズ", "黒胡椒"], estimatedCost: 450, cookingTime: "15分", calories: 680, usedFridgeItems: [] },
          { id: "l2", name: "親子丼", ingredients: ["米", "鶏もも肉", "卵", "玉ねぎ", "醤油", "みりん"], estimatedCost: 400, cookingTime: "20分", calories: 620, usedFridgeItems: useFridge ? ["玉ねぎ"] : [] },
          { id: "l3", name: "鶏むね肉のサラダボウル", ingredients: ["鶏むね肉", "レタス", "トマト", "アボカド", "ゆで卵"], estimatedCost: 520, cookingTime: "15分", calories: 420, usedFridgeItems: [] },
          { id: "l4", name: "焼きうどん", ingredients: ["うどん", "豚肉", "キャベツ", "人参", "醤油"], estimatedCost: 380, cookingTime: "15分", calories: 520, usedFridgeItems: useFridge ? ["キャベツ", "人参"] : [] }
        ],
        dinner: [
          { id: "d1", name: "鶏もも肉のトマト煮込み", ingredients: ["鶏もも肉", "トマト缶", "玉ねぎ", "にんにく", "白ワイン"], estimatedCost: 650, cookingTime: "35分", calories: 520, usedFridgeItems: useFridge ? ["玉ねぎ", "にんにく"] : [] },
          { id: "d2", name: "豚の生姜焼き定食", ingredients: ["豚ロース", "玉ねぎ", "米", "キャベツ", "生姜", "醤油"], estimatedCost: 700, cookingTime: "25分", calories: 680, usedFridgeItems: useFridge ? ["玉ねぎ"] : [] },
          { id: "d3", name: "ハンバーグ、付け合わせ", ingredients: ["合挽き肉", "玉ねぎ", "パン粉", "卵", "じゃがいも", "ブロッコリー"], estimatedCost: 700, cookingTime: "35分", calories: 650, usedFridgeItems: useFridge ? ["玉ねぎ"] : [] },
          { id: "d4", name: "サーモンのムニエル", ingredients: ["サーモン", "じゃがいも", "バター", "レモン", "アスパラ"], estimatedCost: 800, cookingTime: "30分", calories: 550, usedFridgeItems: useFridge ? ["じゃがいも"] : [] }
        ]
      };
      
      setMenuSuggestions(sampleData);

      if (useFridge) {
        const allUsedItems = [
          ...sampleData.breakfast.flatMap(m => m.usedFridgeItems || []),
          ...sampleData.lunch.flatMap(m => m.usedFridgeItems || []),
          ...sampleData.dinner.flatMap(m => m.usedFridgeItems || [])
        ];
        const uniqueUsedItems = [...new Set(allUsedItems)];
        setFridge(fridge.filter(f => !uniqueUsedItems.includes(f.item)));
      }
    }
    setIsLoading(false);
  };

  // チラシ画像からテキスト抽出
  const handleFlyerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: file.type, data: base64 }
                },
                {
                  type: "text",
                  text: "このチラシから商品名と価格を抽出してください。JSONフォーマットで返してください（JSON以外は含めないでください）:\n{\"items\": [{\"name\": \"商品名\", \"price\": 価格（数字のみ）, \"unit\": \"単位\"}]}"
                }
              ]
            }
          ],
        })
      });

      const data = await response.json();
      const text = data.content.find(c => c.type === "text")?.text || "";
      const cleanText = text.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleanText);
      
      const newFlyer = {
        id: Date.now(),
        image: URL.createObjectURL(file),
        items: result.items || [],
        date: new Date().toLocaleDateString('ja-JP')
      };
      
      setFlyers([newFlyer, ...flyers]);
    } catch (error) {
      console.error("チラシ読み取りエラー:", error);
      alert("チラシの読み取りに失敗しました。もう一度お試しください。");
    }
    setIsLoading(false);
  };

  // 買い物リスト合計金額
  const shoppingTotal = shoppingList.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

  // 献立選択
  const selectMenu = (mealType, menu) => {
    setSelectedMenus({...selectedMenus, [mealType]: menu});
  };

  // 選択した献立から買い物リストを生成
  const generateShoppingList = () => {
    const allIngredients = [];
    
    if (selectedMenus.breakfast) allIngredients.push(...selectedMenus.breakfast.ingredients);
    if (selectedMenus.lunch) allIngredients.push(...selectedMenus.lunch.ingredients);
    if (selectedMenus.dinner) allIngredients.push(...selectedMenus.dinner.ingredients);

    const fridgeItems = fridge.map(f => f.item);
    const needToBuy = allIngredients.filter(ing => !fridgeItems.includes(ing));

    const ingredientMap = {};
    needToBuy.forEach(ing => {
      if (!ingredientMap[ing]) {
        ingredientMap[ing] = { count: 0 };
      }
      ingredientMap[ing].count++;
    });

    const prices = {
      "食パン": 150, "卵": 250, "パスタ": 200, "豚ひき肉": 350, "トマト缶": 100,
      "玉ねぎ": 200, "米": 1800, "豚肉": 600, "人参": 150, "じゃがいも": 250,
      "カレールー": 200, "味噌": 300, "わかめ": 150, "納豆": 120, "うどん": 150,
      "キャベツ": 200, "サバ": 450, "大根": 150, "醤油": 300, "牛乳": 200,
      "ネギ": 150, "ハム": 300, "合挽き肉": 450, "パン粉": 150, "レタス": 200,
      "トマト": 250, "レモン": 120, "生姜": 100, "にんにく": 100, "豆板醤": 300,
      "天ぷら": 350, "そば": 200, "豆腐": 100, "海苔": 250, "砂糖": 200
    };

    const amounts = {
      "食パン": "1袋", "卵": "1パック", "パスタ": "300g", "豚ひき肉": "300g", "トマト缶": "1缶",
      "玉ねぎ": "2個", "米": "2kg", "豚肉": "400g", "人参": "2本", "じゃがいも": "4個",
      "カレールー": "1箱", "味噌": "1個", "わかめ": "1袋", "納豆": "3パック", "うどん": "3玉",
      "キャベツ": "1/4個", "サバ": "2切れ", "大根": "1/3本", "醤油": "適量", "牛乳": "500ml",
      "ネギ": "1本", "ハム": "1パック", "合挽き肉": "300g", "パン粉": "1袋", "レタス": "1個",
      "トマト": "2個", "砂糖": "適量", "天ぷら": "適量", "そば": "2束", "豆腐": "1丁",
      "海苔": "1パック", "生姜": "1個", "にんにく": "1個", "豆板醤": "1瓶"
    };

    const newShoppingList = Object.entries(ingredientMap).map(([item, data]) => ({
      item: item,
      amount: amounts[item] || "適量",
      estimatedPrice: prices[item] || 100,
      usedInDays: ["今日"]
    }));

    setShoppingList(newShoppingList);

    const allUsedFridgeItems = [
      ...(selectedMenus.breakfast?.usedFridgeItems || []),
      ...(selectedMenus.lunch?.usedFridgeItems || []),
      ...(selectedMenus.dinner?.usedFridgeItems || [])
    ];
    const uniqueUsedItems = [...new Set(allUsedFridgeItems)];
    setFridge(fridge.filter(f => !uniqueUsedItems.includes(f.item)));

    alert('買い物リストを作成しました！');
    setCurrentPage('shopping');
  };

  // 家計簿ページ
  const AccountBookPage = () => {
    // 月ごとの集計
    const getMonthlyData = () => {
      const monthlyData = {};
      expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, expenses: [] };
        }
        monthlyData[monthKey].total += expense.amount;
        monthlyData[monthKey].expenses.push(expense);
      });
      return monthlyData;
    };

    const monthlyData = getMonthlyData();
    const sortedMonths = Object.keys(monthlyData).sort().reverse();

    return (
      <div className="p-6 space-y-6 pb-28">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
            <DollarSign size={28} color="white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">家計簿</h2>
        </div>

        {/* 当月サマリー */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-amber-900">今月の支出</h3>
          <div className="text-4xl font-black text-amber-700 mb-2">¥{monthlyTotal.toLocaleString()}</div>
          <div className="text-sm text-amber-700">
            予算: ¥{preferences.monthlyBudget.toLocaleString()} / 残り: ¥{remainingBudget.toLocaleString()}
          </div>
          <div className="mt-4 bg-white/50 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
              style={{width: `${Math.min(budgetPercentage, 100)}%`}}
            />
          </div>
        </div>

        {/* 月別履歴 */}
        {sortedMonths.length > 0 ? (
          sortedMonths.map(month => {
            const data = monthlyData[month];
            const [year, monthNum] = month.split('-');
            return (
              <div key={month} className="bg-white border-2 border-gray-100 p-5 rounded-3xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{year}年{monthNum}月</h3>
                  <div className="text-2xl font-black text-green-600">¥{data.total.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  {data.expenses.map(expense => (
                    <div key={expense.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">
                            {new Date(expense.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {expense.items?.length || 0}点の商品
                          </div>
                        </div>
                        <div className="font-bold text-lg text-gray-800">¥{expense.amount.toLocaleString()}</div>
                      </div>
                      {expense.items && expense.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex flex-wrap gap-1">
                            {expense.items.slice(0, 5).map((item, idx) => (
                              <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                {item.item}
                              </span>
                            ))}
                            {expense.items.length > 5 && (
                              <span className="text-xs text-gray-500">+{expense.items.length - 5}個</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16">
            <DollarSign size={64} className="mx-auto mb-4" style={{ color: '#f59e0b', opacity: 0.6 }} strokeWidth={1.5} />
            <p className="font-medium text-gray-600">まだ支出の記録がありません</p>
            <p className="text-sm mt-2">買い物リストから記録を始めましょう</p>
          </div>
        )}
      </div>
    );
  };

  // ホームページ
  const HomePage = () => {
    const totalSelectedCost = 
      (selectedMenus.breakfast?.estimatedCost || 0) +
      (selectedMenus.lunch?.estimatedCost || 0) +
      (selectedMenus.dinner?.estimatedCost || 0);

    return (
      <div className="p-6 space-y-6 pb-28">
        <div className="kondate-card-budget">
          <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '8rem', opacity: 0.2 }}>🍱</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '4.5rem', opacity: 0.2 }}>💰</div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-1 tracking-tight">今月の食費</h2>
            <div className="text-5xl font-black mb-3 tracking-tight">¥{monthlyTotal.toLocaleString()}</div>
            <div className="text-sm opacity-90 font-medium">残り ¥{remainingBudget.toLocaleString()}</div>
            <div className="mt-5 bg-white/20 backdrop-blur rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-500 ${budgetPercentage > 90 ? 'bg-yellow-300' : 'bg-white'} shadow-lg`}
                style={{width: `${Math.min(budgetPercentage, 100)}%`}}
              />
            </div>
            {budgetPercentage > 80 && (
              <div className="mt-4 flex items-center gap-2 bg-yellow-400/30 backdrop-blur px-3 py-2 rounded-xl">
                <AlertTriangle size={18} className="text-yellow-100" />
                <span className="text-sm font-semibold text-yellow-50">予算の{Math.round(budgetPercentage)}%使用中</span>
              </div>
            )}
          </div>
        </div>

        {fridge.length > 0 && (
          <div className="kondate-card-fridge">
            <div className="absolute top-0 right-0 text-6xl opacity-10">🧊</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <line x1="4" y1="10" x2="20" y2="10"/>
                </svg>
              </div>
              <span className="font-bold text-orange-900">冷蔵庫の食材 {fridge.length}個</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {fridge.slice(0, 6).map((f, i) => (
                <span key={i} className="text-xs bg-white border border-orange-200 px-3 py-1.5 rounded-full font-medium text-orange-800 shadow-sm">
                  {f.item}
                </span>
              ))}
              {fridge.length > 6 && (
                <span className="text-xs text-orange-600 font-semibold">+{fridge.length - 6}個</span>
              )}
            </div>
            <button
              onClick={() => generateMenu(true)}
              disabled={isLoading}
              className="kondate-btn-fridge"
              style={{ opacity: isLoading ? 0.5 : 1 }}
            >
              {isLoading ? '献立を考え中...' : '冷蔵庫の食材で献立提案'}
            </button>
          </div>
        )}

        <button
          onClick={() => generateMenu(false)}
          disabled={isLoading}
          className="kondate-btn-main"
          style={{ opacity: isLoading ? 0.5 : 1 }}
        >
          <ChefHat size={24} />
          <span>{isLoading ? '献立を考え中...' : '今日の献立候補を見る'}</span>
        </button>

        {menuSuggestions.breakfast && (
          <>
            {/* 朝食 */}
            <div className="kondate-card-menu">
              <div className="absolute top-0 right-0 text-9xl opacity-5">☀️</div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent flex items-center gap-2">
                🌅 朝食
              </h3>
              <div className="space-y-3">
                {menuSuggestions.breakfast.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => selectMenu('breakfast', menu)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedMenus.breakfast?.id === menu.id
                        ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRecipeModal(menu.name);
                          }}
                          className="font-bold text-lg text-gray-800 hover:text-orange-600 underline decoration-orange-300 decoration-2 underline-offset-2 text-left"
                        >
                          {menu.name}
                        </button>
                        <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-3 flex-wrap">
                          <span>⏱️ {menu.cookingTime}</span>
                          <span className="font-semibold text-orange-600">¥{menu.estimatedCost}</span>
                          <span className="font-semibold text-blue-600">🔥 {menu.calories || 350}kcal</span>
                        </div>
                      </div>
                      {selectedMenus.breakfast?.id === menu.id && (
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                          <Check className="text-white" size={20} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {menu.ingredients.map((ing, idx) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            menu.usedFridgeItems?.includes(ing)
                              ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {ing}{menu.usedFridgeItems?.includes(ing) && ' 🏠'}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 昼食 */}
            <div className="bg-white border-2 border-red-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 text-9xl opacity-5">🍽️</div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                ☀️ 昼食
              </h3>
              <div className="space-y-3">
                {menuSuggestions.lunch.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => selectMenu('lunch', menu)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedMenus.lunch?.id === menu.id
                        ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-yellow-300 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRecipeModal(menu.name);
                          }}
                          className="font-bold text-lg text-gray-800 hover:text-yellow-600 underline decoration-yellow-300 decoration-2 underline-offset-2 text-left"
                        >
                          {menu.name}
                        </button>
                        <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-3 flex-wrap">
                          <span>⏱️ {menu.cookingTime}</span>
                          <span className="font-semibold text-yellow-600">¥{menu.estimatedCost}</span>
                          <span className="font-semibold text-blue-600">🔥 {menu.calories || 500}kcal</span>
                        </div>
                      </div>
                      {selectedMenus.lunch?.id === menu.id && (
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                          <Check className="text-white" size={20} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {menu.ingredients.map((ing, idx) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            menu.usedFridgeItems?.includes(ing)
                              ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {ing}{menu.usedFridgeItems?.includes(ing) && ' 🏠'}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 夕食 */}
            <div className="bg-white border-2 border-pink-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 text-9xl opacity-5">🌙</div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                🌙 夕食
              </h3>
              <div className="space-y-3">
                {menuSuggestions.dinner.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => selectMenu('dinner', menu)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedMenus.dinner?.id === menu.id
                        ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRecipeModal(menu.name);
                          }}
                          className="font-bold text-lg text-gray-800 hover:text-purple-600 underline decoration-purple-300 decoration-2 underline-offset-2 text-left"
                        >
                          {menu.name}
                        </button>
                        <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-3 flex-wrap">
                          <span>⏱️ {menu.cookingTime}</span>
                          <span className="font-semibold text-purple-600">¥{menu.estimatedCost}</span>
                          <span className="font-semibold text-blue-600">🔥 {menu.calories || 650}kcal</span>
                        </div>
                      </div>
                      {selectedMenus.dinner?.id === menu.id && (
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                          <Check className="text-white" size={20} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {menu.ingredients.map((ing, idx) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            menu.usedFridgeItems?.includes(ing)
                              ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {ing}{menu.usedFridgeItems?.includes(ing) && ' 🏠'}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 選択サマリー */}
            {(selectedMenus.breakfast || selectedMenus.lunch || selectedMenus.dinner) && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 p-6 rounded-3xl shadow-lg sticky bottom-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-8xl opacity-10">🎉</div>
                <h3 className="font-bold mb-3 text-orange-900 flex items-center gap-2">
                  <Sparkles className="text-orange-600" size={20} />
                  今日の献立
                </h3>
                <div className="space-y-2 text-sm mb-4 bg-white/50 backdrop-blur p-3 rounded-xl">
                  {selectedMenus.breakfast && <div className="flex items-center gap-2"><span className="text-lg">🌅</span><span className="font-semibold text-orange-800">朝食：</span>{selectedMenus.breakfast.name}</div>}
                  {selectedMenus.lunch && <div className="flex items-center gap-2"><span className="text-lg">☀️</span><span className="font-semibold text-orange-800">昼食：</span>{selectedMenus.lunch.name}</div>}
                  {selectedMenus.dinner && <div className="flex items-center gap-2"><span className="text-lg">🌙</span><span className="font-semibold text-orange-800">夕食：</span>{selectedMenus.dinner.name}</div>}
                </div>
                <div className="text-2xl font-black text-orange-800 mb-4">
                  合計 ¥{totalSelectedCost.toLocaleString()}
                </div>
                <button
                  onClick={generateShoppingList}
                  disabled={!selectedMenus.breakfast && !selectedMenus.lunch && !selectedMenus.dinner}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  買い物リストを作成
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // チラシページ
  const FlyerPage = () => {
    const addToShoppingList = (item) => {
      const existingItem = shoppingList.find(i => i.item === item.name);
      if (existingItem) {
        alert('この商品は既に買い物リストに入っています');
        return;
      }
      
      const newItem = {
        item: item.name,
        amount: item.unit || '1個',
        estimatedPrice: item.price,
        usedInDays: ['チラシから追加']
      };
      
      setShoppingList([...shoppingList, newItem]);
      alert(`${item.name}を買い物リストに追加しました！`);
    };

    return (
      <div className="p-6 space-y-6 pb-28">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #fb7185, #ec4899)' }}>
            <Camera size={28} color="white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">チラシ</h2>
        </div>
        
        <label className="block space-y-3">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-5 px-6 rounded-2xl text-center cursor-pointer font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-lg" style={{ background: 'linear-gradient(90deg, #f43f5e, #ec4899)' }}>
            <Camera size={28} color="white" strokeWidth={2.5} />
            チラシを撮影
          </div>
          <div 
            className="rounded-2xl text-center cursor-pointer font-bold border-2 transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ padding: '1rem 1.5rem', minHeight: 56, fontSize: '1.125rem', background: '#fff1f2', borderColor: '#fda4af', color: '#be123c' }}
          >
            <span>ファイルを選択</span>
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFlyerUpload}
            className="hidden"
          />
        </label>

        {isLoading && (
          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="font-semibold text-blue-700">チラシを読み取り中...</p>
          </div>
        )}

        {flyers.map((flyer) => (
          <div key={flyer.id} className="bg-white border-2 border-gray-100 p-5 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600 font-medium">{flyer.date}</span>
              <button
                onClick={() => setFlyers(flyers.filter(f => f.id !== flyer.id))}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <img src={flyer.image} alt="チラシ" className="w-full rounded-2xl mb-4 shadow-md" />
            <div className="space-y-2">
              {flyer.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => addToShoppingList(item)}
                  className="w-full flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-rose-300 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="text-left flex-1">
                    <span className="font-medium text-gray-800 block">{item.name}</span>
                    {item.unit && <span className="text-xs text-gray-500">{item.unit}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-600 text-lg">¥{item.price}</span>
                    <Plus size={20} className="text-rose-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {flyers.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Camera size={64} className="mx-auto mb-4" style={{ color: '#fb7185', opacity: 0.6 }} strokeWidth={1.5} />
            <p className="font-medium text-gray-600">チラシを撮影して価格をチェック</p>
          </div>
        )}
      </div>
    );
  };

  // 買い物リストページ
  const ShoppingPage = () => {
    const [selectedForExpense, setSelectedForExpense] = useState(() => new Set());
    const toggleSelect = (i) => {
      setSelectedForExpense(prev => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        return next;
      });
    };
    const selectAll = () => setSelectedForExpense(new Set(shoppingList.map((_, i) => i)));
    const selectedItems = shoppingList.filter((_, i) => selectedForExpense.has(i));
    const selectedTotal = selectedItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

    return (
    <div className="p-6 space-y-6 pb-28">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
          <ShoppingCart size={28} color="white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">買い物リスト</h2>
      </div>
      
      {shoppingList.length > 0 ? (
        <>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 p-6 rounded-3xl shadow-sm">
            <div className="text-lg font-bold text-indigo-900 mb-1">合計金額（予想）</div>
            <div className="text-5xl font-black text-indigo-700">¥{shoppingTotal.toLocaleString()}</div>
          </div>

          <div className="flex gap-3 mb-2">
            <button onClick={selectAll} className="text-sm text-indigo-600 font-semibold hover:underline">
              全選択
            </button>
            <span className="text-sm text-gray-500">家計簿に記録するものを選んでください</span>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-3xl shadow-sm overflow-hidden divide-y-2 divide-gray-50">
            {shoppingList.map((item, i) => (
              <label key={i} className={`flex items-start gap-3 p-5 cursor-pointer hover:bg-indigo-50/50 ${selectedForExpense.has(i) ? 'bg-indigo-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedForExpense.has(i)}
                  onChange={() => toggleSelect(i)}
                  className="mt-1 w-5 h-5 accent-indigo-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800">{item.item}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{item.amount}</div>
                      {item.usedInDays && item.usedInDays.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.usedInDays.map((day, idx) => (
                            <span key={idx} className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium border border-indigo-200">
                              {day}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-black text-indigo-600 text-xl">¥{item.estimatedPrice}</div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <button
              onClick={() => {
                const newExpense = {
                  id: Date.now(),
                  amount: selectedTotal,
                  date: new Date().toISOString(),
                  items: selectedItems
                };
                setExpenses([newExpense, ...expenses]);
                setShoppingList(shoppingList.filter((_, i) => !selectedForExpense.has(i)));
                setSelectedForExpense(new Set());
                alert(`${selectedItems.length}点（¥${selectedTotal.toLocaleString()}）を家計簿に記録しました！`);
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={22} color="white" strokeWidth={2.5} />
              選択分（{selectedItems.length}点・¥{selectedTotal.toLocaleString()}）を家計簿へ
            </button>
          )}

          <button
            onClick={() => {
              const newExpense = {
                id: Date.now(),
                amount: shoppingTotal,
                date: new Date().toISOString(),
                items: [...shoppingList]
              };
              setExpenses([newExpense, ...expenses]);
              setShoppingList([]);
              setSelectedForExpense(new Set());
              alert('買い物を記録しました！');
            }}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={24} color="white" strokeWidth={2.5} />
            全リストを買い物完了として記録
          </button>
        </>
      ) : (
        <div className="text-center py-16">
          <ShoppingCart size={64} className="mx-auto mb-4" style={{ color: '#6366f1', opacity: 0.6 }} strokeWidth={1.5} />
          <p className="font-medium text-gray-600">献立を提案すると買い物リストが表示されます</p>
        </div>
      )}
    </div>
  );
  };

  // ナビゲーション
  const NavBar = () => {
    const Fridge = ({ size = 24, color }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="4" y1="10" x2="20" y2="10"/>
        <line x1="7" y1="5" x2="7" y2="8"/>
        <line x1="7" y1="13" x2="7" y2="18"/>
      </svg>
    );

    const navItems = [
      { id: 'home', icon: Calendar, label: 'ホーム', color: '#3b82f6' },
      { id: 'fridge', icon: Fridge, label: '冷蔵庫', badge: fridge.length, color: '#06b6d4' },
      { id: 'flyer', icon: Camera, label: 'チラシ', color: '#ec4899' },
      { id: 'shopping', icon: ShoppingCart, label: '買い物', color: '#f97316' },
      { id: 'account', icon: DollarSign, label: '家計簿', color: '#22c55e' },
      { id: 'settings', icon: Settings, label: '設定', color: '#a855f7' }
    ];

    return (
      <div className="kondate-nav">
        <div className="kondate-nav-inner">
          {navItems.map(({ id, icon: Icon, label, badge, color }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`kondate-nav-btn ${currentPage === id ? 'active' : ''}`}
            >
              <Icon size={26} strokeWidth={id !== 'fridge' ? 2.5 : undefined} color={currentPage === id ? '#ea580c' : color} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: currentPage === id ? '#ea580c' : color }}>{label}</span>
              {badge > 0 && (
                <span className="kondate-nav-badge">{badge}</span>
              )}
              {currentPage === id && (
                <div className="kondate-nav-indicator" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="kondate-app-root">
      <div className="kondate-header">
        <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '8rem', opacity: 0.1 }}>🍳</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '4.5rem', opacity: 0.1 }}>🥘</div>
        <h1>
          <ChefHat size={32} color="white" strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          かしこい献立
        </h1>
      </div>

      {currentPage === 'home' && <HomePage />}
      {currentPage === 'fridge' && <FridgePage fridge={fridge} setFridge={setFridge} selectedCategory={fridgeCategory} setSelectedCategory={setFridgeCategory} />}
      {currentPage === 'flyer' && <FlyerPage />}
      {currentPage === 'shopping' && <ShoppingPage />}
      {currentPage === 'account' && <AccountBookPage />}
      {currentPage === 'settings' && <SettingsPage preferences={preferences} setPreferences={setPreferences} onShowManual={handleShowManual} selectedCategory={settingsCategory} setSelectedCategory={setSettingsCategory} preferenceMode={preferenceMode} setPreferenceMode={setPreferenceMode} />}

      <NavBar />

      {/* 使い方マニュアルモーダル */}
      {showManual && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowManual(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">使い方マニュアル</h3>
              <button onClick={() => setShowManual(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-5 text-sm text-gray-700">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs">
                <div className="font-bold text-orange-800 mb-2">アプリの流れ</div>
                <div className="text-orange-700 mb-2">設定 → 冷蔵庫/チラシ → ホーム → 献立選択 → 買い物リスト → 家計簿</div>
                <div className="text-orange-600">まずは設定で人数や好みを登録し、冷蔵庫に食材を入れてからホームで献立を提案してもらいましょう。</div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2 text-base">各画面の使い方</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <div className="font-bold text-blue-800 mb-1">ホーム</div>
                    <p className="text-xs text-blue-600 mb-2">メインの画面です。AIに献立を提案してもらい、朝・昼・夕の好きなメニューを選びましょう。</p>
                    <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
                      <li>今月の食費と残り予算がひと目でわかります</li>
                      <li>「今日の献立候補を見る」をタップすると、あなたの好みに合った献立をAIが提案します</li>
                      <li>「冷蔵庫の食材で献立提案」を使うと、今ある食材を優先的に使った献立が出ます</li>
                      <li>提案された献立をタップすると、クックパッドやクラシルなどのレシピサイトで作り方を検索できます</li>
                      <li>朝・昼・夕それぞれで好きな献立を選んだら「買い物リストを作成」をタップしましょう</li>
                    </ul>
                  </div>
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3">
                    <div className="font-bold text-cyan-800 mb-1">冷蔵庫</div>
                    <p className="text-xs text-cyan-600 mb-2">今ある食材を登録しておくと、献立提案に反映されます。無駄なく食材を使い切りましょう。</p>
                    <ul className="text-xs text-cyan-700 space-y-0.5 list-disc list-inside">
                      <li>「肉類」「魚介類」「野菜」などのカテゴリから食材をタップして追加します</li>
                      <li>追加した食材には分量（例：「200g」「半分」）を入力できます</li>
                      <li>登録した食材はホームの「冷蔵庫の食材で献立提案」で優先的に使われます</li>
                      <li>不要になった食材はゴミ箱アイコンで削除できます</li>
                    </ul>
                  </div>
                  <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                    <div className="font-bold text-pink-800 mb-1">チラシ</div>
                    <p className="text-xs text-pink-600 mb-2">スーパーのチラシを撮影するだけで、商品名と価格をAIが自動で読み取ります。</p>
                    <ul className="text-xs text-pink-700 space-y-0.5 list-disc list-inside">
                      <li>「チラシを撮影」ボタンからカメラで撮影、またはファイルを選択します</li>
                      <li>AIが自動で商品名と価格を認識してリスト表示します</li>
                      <li>気になる特売品は買い物リストに追加して、お得に買い物しましょう</li>
                    </ul>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                    <div className="font-bold text-indigo-800 mb-1">買い物リスト</div>
                    <p className="text-xs text-indigo-600 mb-2">献立に必要な食材が自動でリストになります。買い物後は家計簿に記録しましょう。</p>
                    <ul className="text-xs text-indigo-700 space-y-0.5 list-disc list-inside">
                      <li>ホームで献立を選んで「買い物リストを作成」すると、必要な食材と予想金額が表示されます</li>
                      <li>冷蔵庫にある食材は自動で除外されるので、本当に買うものだけが表示されます</li>
                      <li>チェックボックスで実際に買ったものだけを選んで「選択分を家計簿へ」で記録できます</li>
                      <li>全部買った場合は「全リストを買い物完了として記録」で一括記録もできます</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="font-bold text-amber-800 mb-1">家計簿</div>
                    <p className="text-xs text-amber-600 mb-2">食費の支出を月ごとに管理できます。予算オーバーを防ぎましょう。</p>
                    <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
                      <li>今月の合計支出と、設定した予算に対する残りがグラフで表示されます</li>
                      <li>買い物リストから記録した支出が日付ごとに一覧で確認できます</li>
                      <li>月ごとの履歴も見られるので、食費の傾向を把握できます</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                    <div className="font-bold text-purple-800 mb-1">設定</div>
                    <p className="text-xs text-purple-600 mb-2">あなたの家族構成や好みに合わせて、献立提案をカスタマイズできます。</p>
                    <ul className="text-xs text-purple-700 space-y-0.5 list-disc list-inside">
                      <li>「何人分？」で家族の人数を設定すると、その人数に合わせた分量で献立が提案されます</li>
                      <li>「月の食費予算」を設定すると、予算内に収まるよう献立を調整します</li>
                      <li>「食生活モード」でバランス型・ダイエット・筋トレ・健康志向・ファミリーから選べます</li>
                      <li>「好き」タブ：よく使いたい食材を選ぶと、積極的に献立に取り入れます</li>
                      <li>「苦手」タブ：避けたい食材を選ぶと、献立に出てこなくなります</li>
                      <li>「除外」タブ：アレルギーのある食材を選ぶと、絶対に使われません</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2 text-base">よくある使い方</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="font-bold text-green-800 mb-1 text-xs">パターン1: 献立を決めてから買い物</div>
                    <div className="text-xs text-green-700 mb-1">今日何を作るか決まっていない時におすすめです。</div>
                    <div className="text-xs text-green-600">設定で好みを登録 → ホームで「献立候補を見る」→ 朝昼夕を選択 → 「買い物リストを作成」→ 買い物 → 家計簿へ記録</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="font-bold text-green-800 mb-1 text-xs">パターン2: 冷蔵庫の食材を使い切る</div>
                    <div className="text-xs text-green-700 mb-1">冷蔵庫に食材が余っている時に便利です。</div>
                    <div className="text-xs text-green-600">冷蔵庫に今ある食材を登録 → ホームで「冷蔵庫の食材で献立提案」→ 足りない材料だけ買い物リストに</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="font-bold text-green-800 mb-1 text-xs">パターン3: チラシの特売を活用</div>
                    <div className="text-xs text-green-700 mb-1">お得な食材を見つけた時に使いましょう。</div>
                    <div className="text-xs text-green-600">チラシ画面で撮影 → 読み取った商品を買い物リストに追加 → 買い物後に家計簿へ記録</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* レシピサイト選択モーダル */}
      {showRecipeModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRecipeModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">レシピサイトを選択</h3>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <p className="text-sm font-bold text-green-800">{selectedRecipe}</p>
            </div>
            <div className="space-y-2">
              {recipeSites.map((site, index) => (
                <button
                  key={index}
                  onClick={() => goToRecipeSite(site)}
                  className="w-full p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                  <span className="text-3xl">{site.icon}</span>
                  <span className="font-bold text-gray-800 text-lg">{site.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KondateApp;