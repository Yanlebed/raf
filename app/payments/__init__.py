from typing import Protocol, Dict


class PaymentGateway(Protocol):
    async def create_payment(self, *, amount: int, currency: str, description: str, metadata: Dict) -> Dict:
        ...


