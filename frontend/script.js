let cart = [];
let userCredits = 1000; // Initial credits
let scanning = false;
let lastScannedCode = null; // 🔥 IMPORTANT

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

/* ---------- START SCAN ---------- */
function startScan() {
  if (scanning) return;
  scanning = true;
  lastScannedCode = null;

  setStatus("📷 Initializing camera...");
  const scanner = document.getElementById("scanner");
  scanner.innerHTML = "";

  try {
    Quagga.stop();
    Quagga.offDetected(onDetected);
  } catch (e) {}

  // Try environment camera first (rear camera)
  initializeCamera("environment", scanner);
}

function initializeCamera(facingMode, scanner) {
  Quagga.init(
    {
      inputStream: {
        type: "LiveStream",
        target: scanner,
        constraints: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      decoder: { readers: ["ean_reader", "code_128_reader", "code_93_reader"] },
      locate: true,
    },
    (err) => {
      if (err) {
        console.error(`Camera error (${facingMode}):`, err);
        
        // Fallback: try user camera if environment failed
        if (facingMode === "environment") {
          console.log("Trying user-facing camera...");
          setStatus("📷 Trying alternative camera...");
          initializeCamera("user", scanner);
        } else {
          // Fallback: try without facing mode
          console.log("Trying camera without constraints...");
          initializeCameraNoConstraints(scanner);
        }
        return;
      }
      
      setStatus("📷 Camera ready - Position barcode");
      Quagga.start();
      Quagga.onDetected(onDetected);
    }
  );
}

function initializeCameraNoConstraints(scanner) {
  Quagga.init(
    {
      inputStream: {
        type: "LiveStream",
        target: scanner,
        constraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      decoder: { readers: ["ean_reader", "code_128_reader", "code_93_reader"] },
      locate: true,
    },
    (err) => {
      if (err) {
        console.error("All camera attempts failed:", err);
        scanning = false;
        setStatus("❌ Camera not accessible - Check browser permissions");
        scanner.innerHTML = `
          <div style="padding: 20px; color: #d32f2f; text-align: center;">
            <p style="font-weight: bold; margin: 10px 0;">Camera Access Required</p>
            <p style="font-size: 12px; margin: 10px 0;">Please:</p>
            <ul style="font-size: 12px; text-align: left; display: inline-block;">
              <li>✓ Connect a webcam</li>
              <li>✓ Allow browser camera access</li>
              <li>✓ Check browser settings</li>
              <li>✓ Reload page</li>
            </ul>
          </div>
        `;
        return;
      }
      
      setStatus("📷 Camera ready - Position barcode");
      Quagga.start();
      Quagga.onDetected(onDetected);
    }
  );
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

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (userCredits < total) {
    const refill = confirm(
      "❌ Insufficient credits.\nDo you want to refill credits?"
    );

    if (refill) {
      userCredits += 500;
      document.getElementById("credits").innerText = userCredits;
      alert("✅ 500 credits added. Please click Pay Now again.");
    }
    return;
  }

  userCredits -= total;
  document.getElementById("credits").innerText = userCredits;

  generateQR(cart, total);

  cart = [];
  updateCart();

  showScreen("pass");

  document.getElementById("payment-status").textContent =
    "✔ PAYMENT SUCCESSFUL";
  document.getElementById("payment-status").className = "verified";

  document.getElementById("credit-message").innerText =
    `Credits deducted: ${total} pts | Remaining credits: ${userCredits} pts`;

  onPaymentSuccess();

  setStatus("💳 Payment completed successfully");
}


/* ---------- QR ---------- */
function generateQR(items, total) {
  const qrBox = document.getElementById("qrBox");
  qrBox.innerHTML = ""; // clear old QR

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
