🛒 Deque – Smart Self-Checkout System

Deque is a smart self-checkout web application designed to reduce long billing queues in shopping malls by enabling customers to scan products, pay digitally, and exit securely without manual billing counters.

🚀 Problem Statement

In shopping malls and supermarkets, customers often waste a lot of time standing in long billing queues. Traditional checkout systems are slow, manpower-dependent, and inefficient during peak hours.

💡 Our Solution

Deque provides a self-checkout system where customers can:

Scan product barcodes themselves

Automatically add items to a cart

Make a cashless payment

Generate a final verification QR code

Exit the store securely using RFID-based validation

This removes the need for traditional billing counters and speeds up the shopping experience.

🔧 How Deque Works (Complete Flow)
1️⃣ Product Scanning

Each product already has a standard EAN-13 barcode.

The customer uses the web app to scan the barcode using the device camera.

Once scanned, the product details (name and price) are fetched from a MongoDB database and added to the cart.

2️⃣ Cart Management

All scanned items appear in a live cart.

The total bill updates automatically.

If a product is scanned by mistake, it can be removed instantly before payment.

3️⃣ Cashless Payment

The system uses a cashless wallet/token system (simulated for prototype).

On clicking Pay Now, the total amount is deducted from the wallet.

This simulates UPI/card-based digital payments without real transactions.

4️⃣ QR Code Generation

After successful payment, the system generates a final QR code.

This QR code contains:

Purchased product list

Total amount

Payment confirmation

Timestamp

5️⃣ Exit Gate Verification (RFID Logic)

At the store exit, a separate QR scanner scans the generated QR code.

The exit system validates the transaction.

RFID tags associated with the paid products are deactivated electronically.

If an unpaid item is carried out, its RFID remains active and triggers the security alarm.

In this prototype, RFID deactivation is simulated logically.
In real deployment, this would be handled using RFID readers and deactivators connected via ESP32 or Raspberry Pi.

🧠 Why This System is Secure

Only items included in the final payment are allowed to exit.

Unpaid items automatically trigger alarms.

No manual verification required.

Reduces theft and human error.

🛠️ Tech Stack
Frontend

HTML

CSS

JavaScript

QuaggaJS (Barcode scanning)

QRCode.js (QR generation)

Backend

Node.js

Express.js

MongoDB (Product database)

📦 Features

📷 Real-time barcode scanning

🧺 Dynamic cart management

❌ Remove items before payment

💰 Cashless wallet simulation

🔐 Secure QR-based exit verification

⚡ Fast and queue-less checkout

🎯 Use Cases

Shopping malls

Supermarkets

Retail stores

College canteens

Smart stores

🔮 Future Enhancements

Real payment gateway integration (UPI/Card)

Actual RFID hardware integration

Mobile app version

Transaction history

Admin dashboard for inventory management

🏆 Conclusion

Deque enables a fast, secure, and user-friendly checkout experience by combining barcode scanning, digital payments, and RFID-based exit validation.
It significantly reduces checkout time and improves customer satisfaction.