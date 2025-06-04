from utils.razorpay_client import razorpay_client

def create_razorpay_order(amount: float, currency: str = "INR") -> dict:
    amount_in_paisa = int(amount * 100)
    return razorpay_client.order.create({
        "amount": amount_in_paisa,
        "currency": currency,
        "payment_capture": 1,
    })
