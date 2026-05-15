async function addToCart() {
    const id = document.getElementById("saleProduct").value;
    const qty = parseInt(document.getElementById("qty").value);
    if (!id || !qty) return alert("Please select product and quantity");
    
    const pDoc = await db.collection("products").doc(id).get();
    const p = pDoc.data();
    
    if (qty > p.stock) return alert("Not enough stock!");
    
    const cart = document.getElementById("cart");
    const div = document.createElement("div");
    div.innerText = `${p.name} x ${qty} = $${p.price * qty}`;
    div.dataset.id = id;
    div.dataset.qty = qty;
    div.dataset.price = p.price;
    div.dataset.name = p.name;
    cart.appendChild(div);
}

async function checkout() {
    const cart = document.getElementById("cart");
    const items = cart.querySelectorAll("div");
    if (items.length === 0) return alert("Cart is empty");
    
    for (const item of items) {
        const id = item.dataset.id;
        const qty = parseInt(item.dataset.qty);
        const total = parseFloat(item.dataset.price) * qty;
        const name = item.dataset.name;
        
        await db.collection("sales").add({
            productId: id,
            product: name,
            qty: qty,
            total: total,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            userId: auth.currentUser.uid
        });
        
        const pRef = db.collection("products").doc(id);
        const pDoc = await pRef.get();
        await pRef.update({ stock: pDoc.data().stock - qty });
    }
    
    cart.innerHTML = "";
    alert("Checkout complete!");
}
