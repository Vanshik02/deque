let cart = [];
let walletBalance = 1000;
let scanning = false;

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

/* ---------- SCAN ---------- */
function startScan() {
  if (scanning) return;
  scanning = true;

  const scanner = document.getElementById("scanner");
  scanner.innerHTML = "";

  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: scanner,
      constraints: { facingMode: "environment" }
    },
    decoder: { readers: ["ean_reader"] }
  }, err => {
    if (err) {
      setStatus("Camera error");
      scanning = false;
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(result => {
    const barcode = result.codeResult.code;
    Quagga.stop();
    scanning = false;

    fetch(`http://localhost:3000/product/${barcode}`)
      .then(res => res.json())
      .then(product => {
        if (!product) {
          setStatus("Product not found");
          return;
        }
        cart.push(product);
        updateCart();
        setStatus(`Added ${product.name}`);
      });
  });
}

/* ---------- CART ---------- */
function updateCart() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.price;
    list.innerHTML += `
      <li>
        ${item.name} - ₹${item.price}
        <button onclick="removeItem(${i})">❌</button>
      </li>`;
  });

  totalEl.innerText = total;
}

function removeItem(i) {
  cart.splice(i, 1);
  updateCart();
}

/* ---------- PAYMENT ---------- */
function payNow() {
  if (cart.length === 0) {
    alert("Cart empty");
    return;
  }

  const total = cart.reduce((s, p) => s + p.price, 0);
  if (walletBalance < total) {
    alert("Insufficient balance");
    return;
  }

  walletBalance -= total;
  document.getElementById("balance").innerText = walletBalance;

  // ✅ GENERATE QR FIRST
  generateQR(cart, total);

  // ✅ THEN CLEAR CART
  cart = [];
  updateCart();

  setStatus("Payment successful");
}

/* ---------- QR ---------- */
function generateQR(items, total) {
  const qrBox = document.getElementById("qrBox");
  qrBox.innerHTML = "";

  new QRCode(qrBox, {
    text: JSON.stringify({
      items,
      total,
      payment: "CASHLESS",
      time: new Date().toISOString()
    }),
    width: 200,
    height: 200
  });
}
