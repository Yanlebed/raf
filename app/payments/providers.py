from typing import Dict

from app.payments import PaymentGateway


class DummyGateway(PaymentGateway):
    async def create_payment(self, *, amount: int, currency: str, description: str, metadata: Dict) -> Dict:
        return {
            "payment_id": "dummy_123",
            "amount": amount,
            "currency": currency,
            "description": description,
            "metadata": metadata,
            "pay_url": "https://example.com/pay/dummy_123",
        }


