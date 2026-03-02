let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =====================
// RENDER CART
// =====================
function renderCart() {
    const cartContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("total-price");

    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<div class='empty'>Cart is Empty</div>";
        totalElement.innerText = "₹0";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
            </div>
            <button onclick="removeItem(${index})">Remove</button>
        `;

        cartContainer.appendChild(div);
    });

    totalElement.innerText = "₹" + total;
}

// =====================
// REMOVE ITEM
// =====================
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

// =====================
// ADD ITEM
// =====================
function addToCart(name, price) {
    cart.push({ name, price });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Item Added to Cart ✅");
}

// =====================
// PAYMENT FUNCTION
// =====================
async function makePayment() {

    if (cart.length === 0) {
        alert("Cart is empty ❌");
        return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

    // ✅ STEP 1: CREATE ORDER (Backend)
    const orderRes = await fetch(
        "https://restaurant-system-1-de4m.onrender.com/api/payment/create-order",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: totalAmount })
        }
    );

    const orderData = await orderRes.json();

    // ✅ STEP 2: RAZORPAY OPTIONS
    const options = {
        key: "rzp_test_SLfFNGOHEWwbff",  // 👈 এখানে তোমার Razorpay Key ID বসাও
        amount: orderData.amount,
        currency: "INR",
        order_id: orderData.id,

        handler: async function (response) {

            // ✅ STEP 3: VERIFY PAYMENT
            const verifyRes = await fetch(
                "https://restaurant-system-1-de4m.onrender.com/api/payment/verify",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        items: cart,
                        totalAmount: totalAmount
                    })
                }
            );

            const data = await verifyRes.json();

           if (data.success) {

    alert("Payment Successful!");

// ✅ Save Active Order
localStorage.setItem("activeOrderId", data.orderId);

// ✅ Redirect to tracking
window.location.href = "tracking.html";

} else {
                alert("Payment verification failed ❌");
            }

            localStorage.removeItem("cart");
            cart = [];
            renderCart();
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

// Page Load
renderCart();