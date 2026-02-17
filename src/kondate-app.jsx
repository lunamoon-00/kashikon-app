import React, { useState, useEffect } from 'react';
import { Camera, ShoppingCart, Calendar, Settings, AlertTriangle, Plus, Trash2, Check, X, ChefHat, Sparkles, DollarSign } from 'lucide-react';

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

  // 食材データベース
  const foodCategories = {
    '肉類': ['豚肉', '豚バラ', '豚ロース', '豚ひき肉', '鶏肉', '鶏もも肉', '鶏むね肉', '鶏ささみ', '鶏ひき肉', '手羽先', '手羽元', '牛肉', '牛バラ', '牛もも肉', '牛ひき肉', 'ステーキ肉', 'すき焼き肉', '合挽き肉', 'ベーコン', 'ハム', 'ソーセージ', 'ウインナー', 'ラム肉', '鴨肉', 'レバー', 'ホルモン'],
    '魚介類': ['サーモン', 'マグロ', 'カツオ', 'サバ', 'イワシ', 'アジ', 'サンマ', 'ブリ', 'タイ', '鮭', 'タラ', 'ホッケ', 'メカジキ', 'エビ', '大エビ', '桜エビ', 'イカ', 'タコ', 'ホタテ', 'アサリ', 'シジミ', 'ハマグリ', 'カキ', 'ホヤ', 'ウニ', 'イクラ', 'タラコ', '明太子', 'しらす', 'ちくわ', 'かまぼこ', 'さつま揚げ', 'ツナ缶', 'サバ缶'],
    '葉物野菜': ['キャベツ', '白菜', 'レタス', 'サニーレタス', 'ほうれん草', '小松菜', 'チンゲン菜', '水菜', '春菊', 'ルッコラ', 'クレソン', 'パクチー', 'バジル', 'パセリ', '大葉', 'ニラ', 'ネギ', '長ネギ', '万能ねぎ', 'セロリ', '三つ葉'],
    '実野菜': ['トマト', 'ミニトマト', 'きゅうり', 'なす', 'ピーマン', 'パプリカ', 'ししとう', 'オクラ', 'ゴーヤ', 'ズッキーニ', 'かぼちゃ', 'とうもろこし', 'アスパラ', 'ブロッコリー', 'カリフラワー', 'スナップエンドウ', 'さやえんどう', 'そら豆', '枝豆', 'もやし'],
    '根菜': ['大根', '人参', 'じゃがいも', 'さつまいも', '里芋', '長芋', '山芋', '玉ねぎ', '新玉ねぎ', '赤玉ねぎ', 'ごぼう', 'れんこん', 'かぶ', '生姜', 'にんにく', 'ラディッシュ', 'ビーツ'],
    '果物': ['りんご', 'バナナ', 'みかん', 'オレンジ', 'グレープフルーツ', 'レモン', 'ライム', 'いちご', 'ブルーベリー', 'ラズベリー', 'ぶどう', '巨峰', 'シャインマスカット', 'キウイ', 'パイナップル', 'メロン', 'スイカ', '桃', 'さくらんぼ', 'プラム', '梨', '柿', 'いちじく', 'マンゴー', 'アボカド'],
    '卵・乳製品': ['卵', '牛乳', '低脂肪乳', '豆乳', 'アーモンドミルク', 'ヨーグルト', 'ギリシャヨーグルト', '飲むヨーグルト', 'チーズ', 'モッツァレラチーズ', 'パルメザンチーズ', 'クリームチーズ', 'カマンベール', 'チェダーチーズ', 'バター', '生クリーム', 'サワークリーム', '練乳'],
    '豆・豆腐': ['豆腐', '絹豆腐', '木綿豆腐', '納豆', 'ひきわり納豆', '油揚げ', '厚揚げ', 'がんもどき', '高野豆腐', '湯葉', '豆乳', 'おから', '枝豆', '大豆', 'ひよこ豆', 'レンズ豆', 'いんげん豆', '小豆'],
    'きのこ': ['しめじ', 'えのき', 'しいたけ', 'まいたけ', 'エリンギ', 'なめこ', 'マッシュルーム', 'エリンギ', 'きくらげ', '松茸'],
    '海藻': ['わかめ', '昆布', 'ひじき', 'もずく', 'めかぶ', '海苔', '焼き海苔', '味付け海苔', '寒天', 'ところてん'],
    '麺類': ['うどん', 'そば', 'そうめん', 'ひやむぎ', 'ラーメン', 'インスタント麺', 'パスタ', 'スパゲティ', 'ペンネ', 'マカロニ', 'フェットチーネ', 'ビーフン', '春雨', 'しらたき', 'くずきり'],
    '米・パン': ['白米', '玄米', '雑穀米', 'もち米', '餅', '食パン', 'ロールパン', 'フランスパン', 'ベーグル', 'イングリッシュマフィン', 'クロワッサン', 'ナン', 'ピタパン', 'トルティーヤ'],
    '粉物': ['小麦粉', '強力粉', '薄力粉', '片栗粉', 'コーンスターチ', 'ホットケーキミックス', 'お好み焼き粉', 'たこ焼き粉', 'から揚げ粉', '天ぷら粉', 'パン粉'],
    '調味料': ['醤油', '濃口醤油', '薄口醤油', '味噌', '赤味噌', '白味噌', '合わせ味噌', 'みりん', '料理酒', '日本酒', '酢', '米酢', '穀物酢', 'リンゴ酢', 'ポン酢', 'めんつゆ', '白だし', '顆粒だし', '鶏ガラスープの素', 'コンソメ', 'ブイヨン', '塩', '砂糖', '三温糖', 'きび糖', 'はちみつ', 'メープルシロップ'],
    '洋風調味料': ['ケチャップ', 'マヨネーズ', 'マスタード', '粒マスタード', 'ウスターソース', '中濃ソース', 'とんかつソース', 'オイスターソース', 'タバスコ', 'チリソース', 'ドレッシング', 'オリーブオイル', 'ごま油', 'サラダ油', 'バルサミコ酢'],
    '香辛料': ['胡椒', '黒胡椒', '一味唐辛子', '七味唐辛子', '山椒', 'わさび', 'からし', '生姜チューブ', 'にんにくチューブ', 'カレー粉', 'ターメリック', 'クミン', 'コリアンダー', 'ナツメグ', 'シナモン', 'ローリエ', 'オレガノ', 'バジル', 'タイム', 'ローズマリー', 'パプリカパウダー'],
    '加工食品': ['冷凍餃子', '冷凍シュウマイ', '冷凍唐揚げ', '冷凍コロッケ', 'インスタントカレー', 'レトルトカレー', 'パスタソース', 'ミートソース', 'ホワイトソース', 'カレールー', 'シチュールー', 'ハヤシライスルー', 'ふりかけ', '漬物', 'キムチ', '梅干し'],
    'その他': ['こんにゃく', '糸こんにゃく', '春雨', 'ナッツ', 'アーモンド', 'くるみ', 'カシューナッツ', 'ピーナッツ', 'ドライフルーツ', 'レーズン', 'プルーン']
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

  // 冷蔵庫ページ
  const FridgePage = () => {
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
                <div key={i} className="flex items-center gap-2 p-3 bg-white/80 backdrop-blur rounded-xl border border-cyan-100 shadow-sm">
                  <span className="flex-1 font-medium text-gray-800">{f.item}</span>
                  <input
                    type="text"
                    value={f.amount}
                    onChange={(e) => updateAmount(f.item, e.target.value)}
                    placeholder="分量"
                    className="w-24 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
                  />
                  <button
                    onClick={() => removeFromFridge(f.item)}
                    className="text-red-400 hover:text-red-600 transition-colors"
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

  // 設定ページ
  const SettingsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('肉類');
    const [preferenceMode, setPreferenceMode] = useState('likes');

    // 主要アレルゲン
    const allergens = [
      '卵', '乳', '小麦', 'そば', '落花生', 'えび', 'かに',
      '大豆', '鶏肉', '豚肉', '牛肉', 'さけ', 'さば', 'いか', 'いくら',
      'オレンジ', 'キウイ', 'バナナ', 'もも', 'りんご', 'くるみ', 'ゼラチン'
    ];

    const toggleFood = (food) => {
      if (preferenceMode === 'likes') {
        if (preferences.likes.includes(food)) {
          setPreferences({...preferences, likes: preferences.likes.filter(f => f !== food)});
        } else {
          setPreferences({...preferences, likes: [...preferences.likes, food]});
        }
      } else if (preferenceMode === 'dislikes') {
        if (preferences.dislikes.includes(food)) {
          setPreferences({...preferences, dislikes: preferences.dislikes.filter(f => f !== food)});
        } else {
          setPreferences({...preferences, dislikes: [...preferences.dislikes, food]});
        }
      } else {
        // allergies
        if (preferences.allergies.includes(food)) {
          setPreferences({...preferences, allergies: preferences.allergies.filter(f => f !== food)});
        } else {
          setPreferences({...preferences, allergies: [...preferences.allergies, food]});
        }
      }
    };

    const isSelected = (food) => {
      if (preferenceMode === 'likes') return preferences.likes.includes(food);
      if (preferenceMode === 'dislikes') return preferences.dislikes.includes(food);
      return preferences.allergies.includes(food);
    };

    return (
      <div className="p-6 space-y-6 pb-28">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            <Settings size={28} color="white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">設定</h2>
        </div>
        
        <div className="bg-white border-2 border-gray-100 p-5 rounded-3xl shadow-sm">
          <label className="block text-base font-bold mb-3 text-gray-800">何人分？</label>
          <input
            type="number"
            value={preferences.servings}
            onChange={(e) => setPreferences({...preferences, servings: parseInt(e.target.value)})}
            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg font-semibold"
            min="1"
            max="10"
          />
        </div>

        <div className="bg-white border-2 border-gray-100 p-5 rounded-3xl shadow-sm">
          <label className="block text-base font-bold mb-3 text-gray-800">月の食費予算（円）</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={preferences.monthlyBudget === 0 ? '' : preferences.monthlyBudget}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, '');
              setPreferences({...preferences, monthlyBudget: cleaned === '' ? 0 : parseInt(cleaned, 10)});
            }}
            placeholder="例: 50000"
            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg font-semibold"
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
                onClick={() => setPreferences({...preferences, lifestyleMode: mode.value})}
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
              <span>🚨 除外</span>
              <span className="tab-count">{preferences.allergies.length}件</span>
            </button>
          </div>

          {preferenceMode === 'allergies' ? (
            <>
              <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl mb-4">
                <p className="text-sm text-orange-800 font-medium">⚠️ これらの食材を含む献立は提案されません</p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {allergens.map(food => (
                  <label
                    key={food}
                    className={`kondate-food-card ${isSelected(food) ? 'selected allergies' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(food)}
                      onChange={() => toggleFood(food)}
                      className="sr-only"
                    />
                    <span className="flex-1 font-medium text-gray-800">{food}</span>
                    {isSelected(food) && <Check color="#f97316" size={20} />}
                  </label>
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
                  <label
                    key={food}
                    className={`kondate-food-card ${isSelected(food) ? `selected ${preferenceMode}` : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(food)}
                      onChange={() => toggleFood(food)}
                      className="sr-only"
                    />
                    <span className="flex-1 font-medium text-gray-800">{food}</span>
                    {isSelected(food) && (
                      <Check color={preferenceMode === 'likes' ? '#22c55e' : '#ef4444'} size={20} />
                    )}
                  </label>
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
                        onClick={() => setPreferences({...preferences, likes: preferences.likes.filter((_, idx) => idx !== i)})}
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
                        onClick={() => setPreferences({...preferences, dislikes: preferences.dislikes.filter((_, idx) => idx !== i)})}
                      />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preferences.allergies.length > 0 && (
              <div>
                <div className="text-sm text-orange-700 font-medium mb-2">🚨 アレルギー除外 ({preferences.allergies.length})</div>
                <div className="flex flex-wrap gap-2">
                  {preferences.allergies.map((item, i) => (
                    <span key={i} className="bg-white border-2 border-orange-400 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-sm">
                      {item}
                      <X
                        size={14}
                        className="cursor-pointer text-orange-600 hover:text-orange-800"
                        onClick={() => setPreferences({...preferences, allergies: preferences.allergies.filter((_, idx) => idx !== i)})}
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
                  {selectedMenus.breakfast && <div className="flex items-center gap-2"><span className="text-lg">🌅</span> {selectedMenus.breakfast.name}</div>}
                  {selectedMenus.lunch && <div className="flex items-center gap-2"><span className="text-lg">☀️</span> {selectedMenus.lunch.name}</div>}
                  {selectedMenus.dinner && <div className="flex items-center gap-2"><span className="text-lg">🌙</span> {selectedMenus.dinner.name}</div>}
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
  const ShoppingPage = () => (
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

          <div className="bg-white border-2 border-gray-100 rounded-3xl shadow-sm overflow-hidden divide-y-2 divide-gray-50">
            {shoppingList.map((item, i) => (
              <div key={i} className="p-5">
                <div className="flex justify-between items-start mb-2">
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
            ))}
          </div>

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
              alert('買い物を記録しました！');
            }}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={24} color="white" strokeWidth={2.5} />
            買い物完了を記録
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
      {currentPage === 'fridge' && <FridgePage />}
      {currentPage === 'flyer' && <FlyerPage />}
      {currentPage === 'shopping' && <ShoppingPage />}
      {currentPage === 'account' && <AccountBookPage />}
      {currentPage === 'settings' && <SettingsPage />}

      <NavBar />

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