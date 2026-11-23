from backend.views.accounts import (
    AccountDetails,
    ConfirmAccount,
    ContactView,
    LoginAccount,
    RegisterAccount,
)
from backend.views.basket import BasketView
from backend.views.catalog import (
    CategoryView,
    ProductInfoDetailView,
    ProductInfoView,
    ShopView,
)
from backend.views.orders import OrderDetailView, OrderStatusView, OrderView
from backend.views.partners import PartnerOrders, PartnerState, PartnerUpdate

__all__ = [
    'AccountDetails',
    'BasketView',
    'CategoryView',
    'ConfirmAccount',
    'ContactView',
    'LoginAccount',
    'OrderDetailView',
    'OrderStatusView',
    'OrderView',
    'PartnerOrders',
    'PartnerState',
    'PartnerUpdate',
    'ProductInfoDetailView',
    'ProductInfoView',
    'RegisterAccount',
    'ShopView',
]
