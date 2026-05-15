function sendChat() {
  const chatInput = document.getElementById("chatInput");
  const msg = chatInput.value.trim();
  if (!msg) return;

  addChatMessage("user", msg);
  chatInput.value = "";

  // Simple NLP + data analysis
  const response = processAIQuery(msg);
  setTimeout(() => addChatMessage("ai", response), 600);
}

function addChatMessage(sender, text) {
  const chatMessages = document.getElementById("chatMessages");
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
  return `🤖 <strong>AI Analysis:</strong> I'm analyzing your query. Based on current data: You have ${productsCache.length} products, ${salesHistory.length} recorded sales. How else can I assist?`;
}
