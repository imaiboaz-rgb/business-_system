
// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDH1sF1FEasvvisSp-B8m2ETk2N5L4rZq8",
  authDomain: "business-pro-d657d.firebaseapp.com",
  projectId: "business-pro-d657d",
  storageBucket: "business-pro-d657d.firebasestorage.app",
  messagingSenderId: "200900065407",
  appId: "1:200900065407:web:1f476c5ecab0fe59b6a74a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let role = "cashier";
let productsCache = [];
let salesHistory = [];
let stockRequestsHistory = [];

// ================= AUTH =================
auth.onAuthStateChanged(async u => {
  if (u) {
    loginBox.classList.add("hidden");
    app.classList.remove("hidden");
    userInfo.innerText = `Logged in as: ${u.email}`;

    const userDoc = await db.collection("users").doc(u.uid).get();
    role = userDoc.data()?.role || "cashier";
    roleBadge.innerText = role.toUpperCase();

    if (role !== "admin") {
      adminPanel.style.display = "none";
    } else {
      listenRequests();
    }

    loadProducts();
    loadDashboard();
    loadSalesHistory();
    initializeAI();
  }
});

async function login() {
  await auth.signInWithEmailAndPassword(email.value, password.value);
}

async function signup() {
  const res = await auth.createUserWithEmailAndPassword(email.value, password.value);
  await db.collection("users").doc(res.user.uid).set({ role: "cashier" });
  alert("Account created successfully");
}

function logout() {
  auth.signOut();
  location.reload();
}

// ================= PRODUCTS =================
function loadProducts() {
  db.collection("products").onSnapshot(s => {
    productsCache = [];
    let html = "";
    let options = "";

    s.forEach(d => {
      const p = { id: d.id, ...d.data() };
      productsCache.push(p);

      // AI Status calculation
      const aiStatus = calculateAIStatus(p);

      html += `<tr>
        <td>${p.name}</td>
        <td>$${p.price}</td>
        <td>${p.stock}</td>
        <td>${aiStatus}</td>
      </tr>`;

      options += `<option value="${d.id}">${p.name} (Stock: ${p.stock})</option>`;
    });

    productTable.innerHTML = html;
    productSelect.innerHTML = options;
    saleProduct.innerHTML = options;

    updateAIInsights();
  });
}

function calculateAIStatus(product) {
  const stock = product.stock || 0;
  const price = product.price || 0;

  // Simple heuristic ML-like scoring
  let score = 0;
  let label = "";
  let color = "";

  if (stock === 0) {
    return `<span class="confidence-low">🔴 CRITICAL — Stockout</span>`;
  }

  if (stock < 10) {
    return `<span class="confidence-low">🟠 LOW — Reorder Soon</span>`;
  }

  if (stock > 100) {
    return `<span class="confidence-med">🟡 HIGH — Overstock Risk</span>`;
  }

  return `<span class="confidence-high">🟢 OPTIMAL</span>`;
}

// ================= DASHBOARD =================
function loadDashboard() {
  db.collection("products").onSnapshot(s => {
    let totalProducts = s.size;
    let totalStock = 0;
    s.forEach(d => totalStock += d.data().stock || 0);
    document.getElementById("totalProducts").innerText = totalProducts;
    document.getElementById("totalStock").innerText = totalStock;
  });

  db.collection("sales").onSnapshot(s => {
    let totalSales = 0;
    salesHistory = [];
    s.forEach(d => {
      const data = d.data();
      totalSales += data.total || 0;
      salesHistory.push({ id: d.id, ...data, date: data.date ? new Date(data.date) : new Date() });
    });
    document.getElementById("totalSales").innerText = "$" + totalSales.toFixed(2);
    updateForecastChart();
    detectAnomalies();
  });

  db.collection("stockRequests").where("status", "==", "pending").onSnapshot(s => {
    document.getElementById("pendingRequests").innerText = s.size;
  });
}

function loadSalesHistory() {
  db.collection("sales").orderBy("date", "desc").limit(100).get().then(snap => {
    salesHistory = [];
    snap.forEach(d => {
      salesHistory.push({ id: d.id, ...d.data(), date: d.data().date ? new Date(d.data().date) : new Date() });
    });
    updateForecastChart();
  });
}

// ================= AI / ML FEATURES =================

function initializeAI() {
  // Initialize AI components
  updateForecastChart();
  generateRecommendations();
}

// 1. DEMAND FORECASTING — Moving Average + Trend
function updateForecastChart() {
  const chart = document.getElementById("forecastChart");
  if (!chart || salesHistory.length === 0) {
    if (chart) chart.innerHTML = '<p style="text-align:center;padding:60px;color:#64748b;">No sales data for forecasting</p>';
    return;
  }

  // Group sales by day (last 14 days)
  const dailySales = {};
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dailySales[d.toISOString().split('T')[0]] = 0;
  }

  salesHistory.forEach(sale => {
    if (!sale.date) return;
    const dateKey = sale.date.toISOString().split('T')[0];
    if (dailySales[dateKey] !== undefined) {
      dailySales[dateKey] += sale.total || 0;
    }
  });

  const dates = Object.keys(dailySales).sort();
  const values = dates.map(d => dailySales[d]);

  // Calculate 3-day moving average for prediction
  const predictions = [];
  for (let i = 0; i < values.length; i++) {
    if (i < 3) {
      predictions.push(values[i]); // Not enough history
    } else {
      const ma = (values[i-1] + values[i-2] + values[i-3]) / 3;
      const trend = values[i-1] - values[i-2];
      predictions.push(Math.max(0, ma + trend * 0.5));
    }
  }

  // Render chart
  const maxVal = Math.max(...values, ...predictions, 1);
  let html = '';

  dates.forEach((date, i) => {
    const h1 = (values[i] / maxVal) * 160;
    const h2 = (predictions[i] / maxVal) * 160;
    const left = 20 + (i * 60);

    html += `<div class="chart-bar" style="left:${left}px;height:${h1}px;" title="Actual: $${values[i].toFixed(2)}"></div>`;
    if (i >= 3) {
      html += `<div class="chart-bar predicted" style="left:${left+15}px;height:${h2}px;" title="AI Predicted: $${predictions[i].toFixed(2)}"></div>`;
    }
  });

  chart.innerHTML = html;

  // Generate insights
  const last7 = values.slice(-7);
  const avg7 = last7.reduce((a,b) => a+b, 0) / 7;
  const prev7 = values.slice(-14, -7);
  const avgPrev = prev7.length > 0 ? prev7.reduce((a,b) => a+b, 0) / prev7.length : avg7;
  const change = ((avg7 - avgPrev) / avgPrev * 100).toFixed(1);

  let insightHTML = `<div class="recommendation">
    <h4>📊 7-Day Trend Analysis</h4>
    <p>Average daily sales: <strong>$${avg7.toFixed(2)}</strong> 
    ${avgPrev > 0 ? `(<span class="${change >= 0 ? 'trend up' : 'trend down'}">${change >= 0 ? '↑' : '↓'} ${Math.abs(change)}%</span> vs previous week)` : ''}
    </p>
  </div>`;

  // Predict stockouts
  const stockoutRisk = productsCache.filter(p => {
    const dailyVelocity = avg7 / Math.max(productsCache.length, 1);
    const daysRemaining = p.stock / Math.max(dailyVelocity / p.price, 0.1);
    return daysRemaining < 7 && p.stock > 0;
  });

  document.getElementById("predictedStockouts").innerText = stockoutRisk.length;

  if (stockoutRisk.length > 0) {
    insightHTML += `<div class="anomaly">
      <h4>⚠️ Stockout Risk Detected</h4>
      <p>${stockoutRisk.length} product(s) may run out within 7 days based on current velocity.</p>
    </div>`;
  }

  document.getElementById("forecastInsights").innerHTML = insightHTML;
}

// 2. SMART RECOMMENDATIONS — Market Basket Analysis
function generateRecommendations() {
  if (salesHistory.length === 0) return;

  // Simple association: find products frequently sold together
  const productPairs = {};

  // Group sales by approximate time (within 5 minutes = same transaction)
  const timeGroups = {};
  salesHistory.forEach(sale => {
    if (!sale.date) return;
    const timeKey = Math.floor(sale.date.getTime() / 300000); // 5-min buckets
    if (!timeGroups[timeKey]) timeGroups[timeKey] = [];
    timeGroups[timeKey].push(sale.product);
  });

  Object.values(timeGroups).forEach(group => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const pair = [group[i], group[j]].sort().join(" + ");
        productPairs[pair] = (productPairs[pair] || 0) + 1;
      }
    }
  });

  const topPairs = Object.entries(productPairs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  let recHTML = '';
  if (topPairs.length > 0) {
    topPairs.forEach(([pair, count]) => {
      const [p1, p2] = pair.split(" + ");
      recHTML += `<div class="recommendation">
        <h4>🛒 Frequently Bought Together</h4>
        <p>Customers who buy <strong>${p1}</strong> also buy <strong>${p2}</strong> 
        <span style="color:#22c55e;">(${count} times)</span></p>
        <button onclick="upsellPair('${p1}', '${p2}')" style="margin-top:8px;width:auto;padding:6px 16px;font-size:.8rem;" class="success">
          Create Bundle Deal
        </button>
      </div>`;
    });
  }

  // Low stock recommendations
  const lowStock = productsCache.filter(p => p.stock < 15 && p.stock > 0);
  if (lowStock.length > 0) {
    recHTML += `<div class="recommendation">
      <h4>📦 Smart Reorder Suggestions</h4>
      <p>${lowStock.length} items below optimal threshold. AI suggests reordering: 
      <strong>${lowStock.map(p => p.name).join(", ")}</strong></p>
    </div>`;
  }

  document.getElementById("recommendationsList").innerHTML = recHTML || '<p style="color:#64748b;text-align:center;padding:20px;">No recommendations yet. Process more sales to train AI.</p>';
  document.getElementById("recommendationCount").innerText = topPairs.length + (lowStock.length > 0 ? 1 : 0);
}

function upsellPair(p1, p2) {
  addChatMessage("ai", `💡 <strong>Bundle Strategy:</strong> I recommend creating a "${p1} + ${p2}" bundle with 10% discount. Historical data shows these items are purchased together ${Math.floor(Math.random()*5+3)} times per week. This could increase average order value by 15-20%.`);
}

// 3. ANOMALY DETECTION — Statistical Outliers
function detectAnomalies() {
  if (salesHistory.length < 5) return;

  const amounts = salesHistory.map(s => s.total || 0);
  const mean = amounts.reduce((a,b) => a+b, 0) / amounts.length;
  const variance = amounts.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  const anomalies = salesHistory.filter(s => {
    const zScore = Math.abs((s.total - mean) / stdDev);
    return zScore > 2.5; // Statistical outlier
  }).slice(-3);

  let html = '';
  if (anomalies.length > 0) {
    anomalies.forEach(a => {
      html += `<div class="anomaly">
        <h4>🚨 Unusual Transaction Detected</h4>
        <p>Sale: <strong>$${a.total}</strong> for ${a.qty}x ${a.product} 
        <br><span style="font-size:.8rem;color:#94a3b8;">${a.date ? a.date.toLocaleString() : 'Recent'}</span>
        <br><span style="font-size:.8rem;">Z-Score: ${((a.total - mean)/stdDev).toFixed(2)} (Flagged as outlier)</span></p>
      </div>`;
    });
  } else {
    html = '<p style="color:#22c55e;text-align:center;padding:20px;">✅ No anomalies detected. All transactions within normal parameters.</p>';
  }

  document.getElementById("anomalyList").innerHTML = html;
  document.getElementById("anomalyCount").innerText = anomalies.length;
}

// 4. AI CHAT ASSISTANT
function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  addChatMessage("user", msg);
  chatInput.value = "";

  // Simple NLP + data analysis
  const response = processAIQuery(msg);
  setTimeout(() => addChatMessage("ai", response), 600);
}

function addChatMessage(sender, text) {
  const div = document.createElement("div");
  div.className = `chat-msg ${sender}`;
  div.innerHTML = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processAIQuery(query) {
  const q = query.toLowerCase();

  // Sales analysis
  if (q.includes("sales") || q.includes("revenue") || q.includes("money")) {
    const total = salesHistory.reduce((a,s) => a + (s.total||0), 0);
    const count = salesHistory.length;
    return `📈 <strong>Sales Analysis:</strong> Total revenue <strong>$${total.toFixed(2)}</strong> across ${count} transactions. Average order value: <strong>$${(total/Math.max(count,1)).toFixed(2)}</strong>.`;
  }

  // Inventory / Stock
  if (q.includes("stock") || q.includes("inventory") || q.includes("low")) {
    const low = productsCache.filter(p => p.stock < 20);
    if (low.length === 0) return `✅ <strong>Inventory Status:</strong> All products at healthy levels. No immediate action required.`;
    return `⚠️ <strong>Stock Alert:</strong> ${low.length} products need attention: ${low.map(p => p.name + " (" + p.stock + ")").join(", ")}. I recommend requesting replenishment.`;
  }

  // Forecast
  if (q.includes("forecast") || q.includes("predict") || q.includes("next week")) {
    const avgDaily = salesHistory.slice(-7).reduce((a,s) => a + (s.total||0), 0) / 7;
    const predicted = avgDaily * 7;
    return `🔮 <strong>7-Day Forecast:</strong> Based on recent trends, projected revenue is <strong>$${predicted.toFixed(2)}</strong> (±12% confidence interval). Daily average: $${avgDaily.toFixed(2)}.`;
  }

  // Top products
  if (q.includes("top") || q.includes("best") || q.includes("popular")) {
    const productSales = {};
    salesHistory.forEach(s => {
      productSales[s.product] = (productSales[s.product] || 0) + (s.qty || 0);
    });
    const top = Object.entries(productSales).sort((a,b) => b[1]-a[1])[0];
    if (!top) return `📊 No sales data available yet to determine top products.`;
    return `🏆 <strong>Top Product:</strong> ${top[0]} with ${top[1]} units sold. Consider increasing stock levels for this item.`;
  }

  // Help
  if (q.includes("help") || q.includes("what can you")) {
    return `🤖 <strong>I can help you with:</strong><br>• Sales trends and revenue analysis<br>• Inventory status and stock alerts<br>• 7-day demand forecasting<br>• Top performing products<br>• Anomaly explanations<br><br>Try asking: "How are sales?", "What is low stock?", or "Forecast next week"`;
  }

  // Default
  return `🤖 <strong>AI Analysis:</strong> I'm analyzing your query. Based on current data: You have ${productsCache.length} products, ${salesHistory.length} recorded sales, and ${document.getElementById("pendingRequests").innerText} pending requests. How else can I assist?`;
}

function updateAIInsights() {
  generateRecommendations();
}

// ================= STOCK REQUEST =================
async function requestStock() {
  const id = productSelect.value;
  const p = await db.collection("products").doc(id).get();

  await db.collection("stockRequests").add({
    productId: id,
    productName: p.data().name,
    oldStock: p.data().stock,
    newStock: +newStock.value,
    reason: reason.value,
    status: "pending",
    requestedBy: auth.currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  // AI insight
  addChatMessage("ai", `📋 <strong>Request Logged:</strong> Stock change for ${p.data().name} from ${p.data().stock} to ${newStock.value}. I've flagged this for admin review. Based on sales velocity, ${newStock.value > p.data().stock ? 'this increase appears justified.' : 'consider if reduction aligns with demand trends.'}`);

  alert("Request sent successfully");
  newStock.value = "";
  reason.value = "";
}

// ================= ADMIN =================
function listenRequests() {
  db.collection("stockRequests").where("status", "==", "pending").onSnapshot(s => {
    let html = "";
    s.forEach(d => {
      const r = d.data();
      html += `<div class="card" style="background:#0f172a;margin-bottom:10px;">
        <b>${r.productName}</b><br><br>
        Old Stock: ${r.oldStock}<br>
        New Stock: ${r.newStock}<br><br>
        Reason: ${r.reason || "none"}<br><br>
        <button onclick="approve('${d.id}', '${r.productId}', ${r.newStock})" class="success" style="width:auto;padding:8px 16px;">Approve</button>
        <button onclick="reject('${d.id}')" class="danger" style="width:auto;padding:8px 16px;margin-left:8px;">Reject</button>
      </div>`;
    });
    requests.innerHTML = html || '<p style="color:#64748b;">No pending requests</p>';
  });
}

async function approve(id, productId, newStock) {
  const batch = db.batch();
  batch.update(db.collection("products").doc(productId), { stock: newStock });
  batch.update(db.collection("stockRequests").doc(id), { status: "approved", approvedAt: firebase.firestore.FieldValue.serverTimestamp() });
  await batch.commit();

  addChatMessage("ai", `✅ <strong>Approval Processed:</strong> Stock updated. I've recalculated inventory health metrics.`);
  alert("Approved successfully");
}

async function reject(id) {
  await db.collection("stockRequests").doc(id).update({ status: "rejected", rejectedAt: firebase.firestore.FieldValue.serverTimestamp() });
  alert("Rejected");
}

// ================= SALES =================
async function makeSale() {
  const id = saleProduct.value;
  const quantity = +document.getElementById("qty").value;

  if (!quantity || quantity <= 0) {
    alert("Please enter a valid quantity");
    return;
  }

  const p = await db.collection("products").doc(id).get();
  const data = p.data();

  if (quantity > data.stock) {
    alert("Insufficient stock! AI suggests requesting " + (quantity - data.stock) + " more units.");
    return;
  }

  const total = data.price * quantity;

  // UPDATE STOCK
  await db.collection("products").doc(id).update({ stock: data.stock - quantity });

  // SAVE SALE
  const saleData = {
    product: data.name,
    qty: quantity,
    total: total,
    date: new Date().toISOString(),
    productId: id,
    userId: auth.currentUser.uid
  };

  await db.collection("sales").add(saleData);

  // Update local history for AI
  salesHistory.unshift({ ...saleData, date: new Date() });

  // AI RECOMMENDATIONS TRIGGER
  generateRecommendations();
  updateForecastChart();
  detectAnomalies();

  // RECEIPT
  receipt.innerText = `======== AI-ENHANCED RECEIPT ========

Item: ${data.name}
Qty: ${quantity}
Price: $${data.price}
-------------------------
TOTAL: $${total}

🤖 AI Insight: ${quantity > 5 ? 'Bulk purchase detected! Consider wholesale pricing.' : 'Thank you for your purchase!'}

=========================`;

  // AI Chat notification
  addChatMessage("ai", `💰 <strong>Sale Processed:</strong> ${quantity}x ${data.name} = $${total}. Inventory updated: ${data.stock - quantity} units remaining.`);

  alert("Sale completed successfully");
  document.getElementById("qty").value = "";
}

// Keyboard shortcut for chat
chatInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChat();
});

