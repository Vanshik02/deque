let cart = [];
let walletBalance = 10000;
let scanning = false;
let lastScannedCode = null; // 🔥 IMPORTANT

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

/* ---------- START SCAN ---------- */
function startScan() {
  if (scanning) return;
  scanning = true;
  lastScannedCode = null; // reset for new scan

  setStatus("📷 Scanning barcode...");
  const scanner = document.getElementById("scanner");

  try {
    Quagga.stop();
    Quagga.offDetected(onDetected);
  } catch (e) {}

  scanner.innerHTML = "";

  Quagga.init(
    {
      inputStream: {
        type: "LiveStream",
        target: scanner,
        constraints: { facingMode: "environment" },
      },
      decoder: { readers: ["ean_reader"] },
      locate: true,
    },
    (err) => {
      if (err) {
        setStatus("❌ Camera error");
        scanning = false;
        return;
      }
      Quagga.start();
    }
  );

  Quagga.onDetected(onDetected);
}

/* ---------- ON DETECT ---------- */
function onDetected(result) {
  const barcode = result.codeResult.code;

  // 🔒 BLOCK DUPLICATES
  if (barcode === lastScannedCode) return;
  lastScannedCode = barcode;

  Quagga.offDetected(onDetected);
  Quagga.stop();
  scanning = false;

  document.getElementById("scanner").innerHTML =
    "✅ Scan complete. Click Start Scan to scan next item.";

  setStatus("✅ Scanned: " + barcode);

  fetch(`http://localhost:3000/product/${barcode}`)
    .then((res) => res.json())
    .then((product) => {
      if (!product) {
        setStatus("❌ Product not found");
        return;
      }

      cart.push(product);
      updateCart();
      setStatus(`🛒 Added ${product.name} (₹${product.price})`);
    })
    .catch(() => setStatus("❌ Backend not reachable"));
}

/* ---------- CART ---------- */
function updateCart() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    list.innerHTML += `
      <li>
        ${item.name} - ₹${item.price}
        <button onclick="removeFromCart(${index})">❌</button>
      </li>`;
  });

  totalEl.innerText = total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

/* ---------- PAYMENT ---------- */
function payNow() {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const total = cart.reduce((s, p) => s + p.price, 0);
  if (walletBalance < total) {
    alert("Insufficient balance");
    return;
  }

  walletBalance -= total;
  document.getElementById("balance").innerText = walletBalance;

  generateQR(cart, total);

  cart = [];
  updateCart();
  setStatus("💰 Payment successful");
  onPaymentSuccess();
  showScreen("pass");  
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
      time: new Date().toISOString(),
    }),
    width: 200,
    height: 200,
  });
}
