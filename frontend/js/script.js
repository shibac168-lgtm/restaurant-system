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
// ADD ITEM (IMPORTANT)
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

    const response = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount })
    });

    const data = await response.json();

    const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        order_id: data.orderId,

        handler: async function (response) {

            await fetch("http://localhost:5000/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...response,
                    cart,
                    totalAmount
                })
            });

            alert("Payment Successful ✅");

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