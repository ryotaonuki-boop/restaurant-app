import React, { useState, useEffect, useRef } from "react";

const MENU = [
  { id: 1, category: "前菜", name: "枝豆", price: 380, emoji: "🫛", desc: "塩ゆで枝豆" },
  { id: 2, category: "前菜", name: "唐揚げ", price: 580, emoji: "🍗", desc: "サクサク鶏唐揚げ" },
  { id: 3, category: "前菜", name: "冷奴", price: 280, emoji: "🧊", desc: "薬味たっぷり冷奴" },
  { id: 4, category: "麺・ご飯", name: "ラーメン", price: 880, emoji: "🍜", desc: "醤油ベースのスープ" },
  { id: 5, category: "麺・ご飯", name: "炒飯", price: 780, emoji: "🍚", desc: "パラパラ本格炒飯" },
  { id: 6, category: "麺・ご飯", name: "焼きそば", price: 750, emoji: "🍝", desc: "ソース焼きそば" },
  { id: 7, category: "ドリンク", name: "生ビール", price: 550, emoji: "🍺", desc: "キンキンに冷えた生" },
  { id: 8, category: "ドリンク", name: "ハイボール", price: 480, emoji: "🥃", desc: "サントリー角ハイ" },
  { id: 9, category: "ドリンク", name: "コーラ", price: 280, emoji: "🥤", desc: "コカコーラ" },
  { id: 10, category: "デザート", name: "アイスクリーム", price: 380, emoji: "🍨", desc: "バニラ / チョコ" },
  { id: 11, category: "デザート", name: "プリン", price: 320, emoji: "🍮", desc: "なめらかカスタード" },
];

const CATEGORIES = ["すべて", "前菜", "麺・ご飯", "ドリンク", "デザート"];
const TABLES = [1, 2, 3, 4, 5, 6];

let orderIdCounter = 1;

export default function App() {
  const [view, setView] = useState("customer"); // "customer" | "staff"
  const [tableNum, setTableNum] = useState(3);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("すべて");
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [orderSent, setOrderSent] = useState(false);
  const prevOrderCount = useRef(0);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const filteredMenu = category === "すべて" ? MENU : MENU.filter(i => i.category === category);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    showToast(`${item.emoji} ${item.name} を追加！`);
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      const next = prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0);
      return next;
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const sendOrder = () => {
    if (!cart.length) return;
    const newOrder = {
      id: orderIdCounter++,
      table: tableNum,
      items: [...cart],
      total: cartTotal,
      time: new Date(),
      status: "新規",
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 3000);
  };

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  // Badge pulse for new orders
  const newOrderCount = orders.filter(o => o.status === "新規").length;

  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif", minHeight: "100vh", background: "#0f0f10", color: "#f0ede8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a1c; }
        ::-webkit-scrollbar-thumb { background: #d4a853; border-radius: 2px; }

        .tab-btn { padding: 10px 28px; border: none; border-radius: 999px; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; letter-spacing: 0.05em; }
        .tab-active { background: #d4a853; color: #0f0f10; }
        .tab-inactive { background: #1e1e20; color: #888; }
        .tab-inactive:hover { background: #2a2a2d; color: #ccc; }

        .cat-btn { padding: 7px 18px; border-radius: 999px; border: 1.5px solid transparent; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.18s; }
        .cat-active { background: #d4a853; border-color: #d4a853; color: #0f0f10; }
        .cat-inactive { background: transparent; border-color: #333; color: #aaa; }
        .cat-inactive:hover { border-color: #d4a853; color: #d4a853; }

        .menu-card { background: #1a1a1c; border-radius: 16px; padding: 18px; border: 1px solid #2a2a2d; transition: all 0.2s; cursor: pointer; position: relative; overflow: hidden; }
        .menu-card:hover { border-color: #d4a853; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,168,83,0.12); }
        .menu-card:hover .add-btn { background: #d4a853; color: #0f0f10; }
        .add-btn { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #d4a853; background: transparent; color: #d4a853; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.18s; flex-shrink: 0; }

        .qty-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #444; background: #2a2a2d; color: #f0ede8; font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .qty-btn:hover { background: #d4a853; border-color: #d4a853; color: #0f0f10; }

        .order-btn { width: 100%; padding: 16px; background: #d4a853; border: none; border-radius: 14px; font-family: inherit; font-size: 16px; font-weight: 900; color: #0f0f10; cursor: pointer; transition: all 0.2s; letter-spacing: 0.08em; }
        .order-btn:hover:not(:disabled) { background: #e8be6a; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,168,83,0.35); }
        .order-btn:disabled { opacity: 0.35; cursor: default; }

        .status-badge { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .status-新規 { background: #ff4757; color: white; animation: pulse 1.5s infinite; }
        .status-調理中 { background: #f39c12; color: #0f0f10; }
        .status-提供済 { background: #2ecc71; color: #0f0f10; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.6} }

        .toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 700; z-index: 999; animation: toastIn 0.3s ease; white-space: nowrap; }
        .toast-success { background: #2ecc71; color: #0f0f10; }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }

        .success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s; }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }

        .order-card { background: #1a1a1c; border-radius: 16px; padding: 16px; border: 1px solid #2a2a2d; margin-bottom: 12px; }
        .order-card.new-order { border-color: #ff4757; }

        .staff-btn { padding: 7px 14px; border-radius: 8px; border: none; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .btn-cooking { background: #f39c12; color: #0f0f10; }
        .btn-served { background: #2ecc71; color: #0f0f10; }
        .btn-cooking:hover { opacity: 0.85; }
        .btn-served:hover { opacity: 0.85; }

        .notif-dot { position: absolute; top: -4px; right: -4px; background: #ff4757; color: white; font-size: 10px; font-weight: 900; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#141416", borderBottom: "1px solid #2a2a2d", padding: "14px 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#d4a853", letterSpacing: "0.05em" }}>炉端 IZAKAYA</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>テーブル {tableNum}番</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`tab-btn ${view === "customer" ? "tab-active" : "tab-inactive"}`} onClick={() => setView("customer")}>注文する</button>
            <button className={`tab-btn ${view === "staff" ? "tab-active" : "tab-inactive"}`} style={{ position: "relative" }} onClick={() => setView("staff")}>
              管理
              {newOrderCount > 0 && <span className="notif-dot">{newOrderCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 100px" }}>

        {/* ===== CUSTOMER VIEW ===== */}
        {view === "customer" && (
          <>
            {/* Table selector */}
            <div style={{ padding: "16px 0 8px", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#888", flexShrink: 0 }}>テーブル：</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TABLES.map(t => (
                  <button key={t} onClick={() => setTableNum(t)} style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${tableNum === t ? "#d4a853" : "#333"}`, background: tableNum === t ? "#d4a853" : "transparent", color: tableNum === t ? "#0f0f10" : "#888", font: "inherit", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "8px 0 12px", scrollbarWidth: "none" }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`cat-btn ${category === c ? "cat-active" : "cat-inactive"}`} onClick={() => setCategory(c)} style={{ flexShrink: 0 }}>{c}</button>
              ))}
            </div>

            {/* Menu grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {filteredMenu.map(item => {
                const inCart = cart.find(c => c.id === item.id);
                return (
                  <div key={item.id} className="menu-card" onClick={() => addToCart(item)}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{item.emoji}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#777", marginBottom: 8 }}>{item.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#d4a853" }}>¥{item.price.toLocaleString()}</div>
                      <button className="add-btn" onClick={e => { e.stopPropagation(); addToCart(item); }}>+</button>
                    </div>
                    {inCart && (
                      <div style={{ position: "absolute", top: 10, right: 10, background: "#d4a853", color: "#0f0f10", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>{inCart.qty}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cart summary */}
            {cart.length > 0 && (
              <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#141416", borderTop: "1px solid #2a2a2d", padding: "12px 20px 24px", zIndex: 40 }}>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                  <div style={{ marginBottom: 10 }}>
                    {cart.map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 18 }}>{c.emoji}</span>
                          <span style={{ fontSize: 13, truncate: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{c.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <button className="qty-btn" onClick={() => updateQty(c.id, -1)}>−</button>
                          <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{c.qty}</span>
                          <button className="qty-btn" onClick={() => updateQty(c.id, 1)}>+</button>
                          <span style={{ fontSize: 13, color: "#d4a853", minWidth: 56, textAlign: "right" }}>¥{(c.price * c.qty).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="order-btn" onClick={sendOrder}>
                    注文する　¥{cartTotal.toLocaleString()}　({cartCount}品)
                  </button>
                </div>
              </div>
            )}

            {cart.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#555", fontSize: 13 }}>
                メニューをタップして注文に追加しよう
              </div>
            )}
          </>
        )}

        {/* ===== STAFF VIEW ===== */}
        {view === "staff" && (
          <>
            <div style={{ padding: "16px 0 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>注文管理</div>
              <div style={{ fontSize: 13, color: "#888" }}>
                未対応 <span style={{ color: "#ff4757", fontWeight: 700 }}>{newOrderCount}</span>件
              </div>
            </div>

            {orders.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
                <div style={{ fontSize: 14 }}>まだ注文はありません</div>
              </div>
            )}

            {orders.map(order => (
              <div key={order.id} className={`order-card ${order.status === "新規" ? "new-order" : ""}`}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>#{order.id}</div>
                    <div style={{ background: "#2a2a2d", padding: "3px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                      🪑 {order.table}番
                    </div>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    {order.time.getHours()}:{String(order.time.getMinutes()).padStart(2, "0")}
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", borderBottom: "1px solid #222" }}>
                      <span>{item.emoji} {item.name} × {item.qty}</span>
                      <span style={{ color: "#d4a853" }}>¥{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 900, color: "#d4a853" }}>合計 ¥{order.total.toLocaleString()}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {order.status === "新規" && (
                      <button className="staff-btn btn-cooking" onClick={() => updateStatus(order.id, "調理中")}>調理中へ</button>
                    )}
                    {order.status === "調理中" && (
                      <button className="staff-btn btn-served" onClick={() => updateStatus(order.id, "提供済")}>提供済へ</button>
                    )}
                    {order.status === "提供済" && (
                      <span style={{ fontSize: 13, color: "#2ecc71", fontWeight: 700 }}>✓ 完了</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* Order success overlay */}
      {orderSent && (
        <div className="success-overlay" onClick={() => setOrderSent(false)}>
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#d4a853", marginBottom: 8 }}>ご注文を受け付けました</div>
            <div style={{ fontSize: 14, color: "#888" }}>しばらくお待ちください</div>
          </div>
        </div>
      )}
    </div>
  );
}
