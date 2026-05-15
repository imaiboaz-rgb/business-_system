async function loadData() {
  db.collection("products").onSnapshot(s => {
    productsCache = s.docs.map(d => ({ id: d.id, ...d.data() }));
    updateInventoryUI();
  });
  db.collection("sales").orderBy("date", "desc").limit(50).onSnapshot(s => {
    salesHistory = s.docs.map(d => ({ ...d.data(), date: d.data().date ? (typeof d.data().date === 'string' ? new Date(d.data().date) : d.data().date.toDate()) : new Date() }));
    updateForecast();
    detectAnomalies();
  });
}

function updateInventoryUI() {
  const table = document.getElementById("productTable");
  const select = document.getElementById("saleProduct");
  if (table) table.innerHTML = productsCache.map(p => `<tr><td>${p.name}</td><td>$${p.price}</td><td>${p.stock}</td></tr>`).join("");
  if (select) select.innerHTML = productsCache.map(p => `<option value="${p.id}">${p.name} ($${p.price})</option>`).join("");
}

function updateForecast() {
  // Simple forecast visualization
}

function detectAnomalies() {
  // Simple anomaly detection logic
}

async function makeSale() {
  const id = document.getElementById("saleProduct").value;
  const qty = parseInt(document.getElementById("qty").value);
  if(!id || !qty) return alert("Select product and quantity");
  
  const p = productsCache.find(x => x.id === id);
  if(qty > p.stock) return alert("Not enough stock!");
  
  const total = p.price * qty;
  await db.collection("sales").add({
    productId: id,
    product: p.name,
    qty: qty,
    total: total,
    date: firebase.firestore.FieldValue.serverTimestamp(),
    userId: auth.currentUser.uid
  });
  await db.collection("products").doc(id).update({ stock: p.stock - qty });
  alert("Sale complete!");
}
