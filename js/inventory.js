function loadData() {
    db.collection("products").onSnapshot(snapshot => {
        const table = document.getElementById("productTable");
        const select = document.getElementById("saleProduct");
        let tableHtml = "";
        let selectHtml = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            tableHtml += `<tr><td>${p.name}</td><td>$${p.price}</td><td>${p.stock}</td></tr>`;
            selectHtml += `<option value="${doc.id}">${p.name} ($${p.price})</option>`;
        });
        if (table) table.innerHTML = tableHtml;
        if (select) select.innerHTML = selectHtml;
    });
}
