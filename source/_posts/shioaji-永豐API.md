---
title: shioaji 永豐API
tags:
  - [api]
  - [python]
  - [shioaji]
cover: /img/cover/cover02.jpg
date: 2023-09-13 14:50:32
---

# Quick Start

```python
!pip install shioaji
!pip install -U shioaji
# docker run -it sinotrade/shioaji:latest
# docker run -p 8888:8888 sinotrade/shioaji:jupyter
```

# Login

```python
import shioaji as sj
print(sj.__version__)
print("*"*20)

# 模擬模式
api = sj.Shioaji(simulation = True)

# 需到官方網站申請API
accounts =  api.login("YOUR_API_KEY", 
											"YOUR_SECRET_KEY")
print(accounts)

# 憑證需要先下載永豐windows App ，OS X 就沒有研究了
api.activate_ca(
    ca_path="/c/your/ca/path/Sinopac.pfx",
    ca_passwd="YOUR_CA_PASSWORD",
    person_id="Person of this Ca",
)
```

### Logout

```python
api.logout()
# True
```

# 下單

```python
# contract - 合同
contract = api.Contracts.Stocks.TSE["2890"]

# order - 單
order = api.Order(
    price = 18, 
    quantity = 1, 
    action = sj.constant.Action.Buy, 
    price_type = sj.constant.StockPriceType.LMT, 
    order_type = sj.constant.OrderType.ROD, 
    account = api.stock_account
)

# place order
trade = api.place_order(contract, order)
trade

'''trade

Trade(
    contract=Stock(
        exchange=<Exchange.TSE: 'TSE'>,
        code='2890',
        symbol='TSE2890',
        name='永豐金',
        category='17',
        unit=1000,
        limit_up=19.05,
        limit_down=15.65,
        reference=17.35,
        update_date='2023/09/11',
        day_trade=<DayTrade.Yes: 'Yes'>
    ),
    order=Order(
        action=<Action.Buy: 'Buy'>,
        price=18,
        quantity=1,
        id='fa0bc4c8',
        seqno='000108',
        ordno='000003',
        account=Account(
            account_type=<AccountType.Stock: 'S'>,
            person_id='F129760296',
            broker_id='9A9K',
            account_id='0264271'
        ),
        price_type=<StockPriceType.LMT: 'LMT'>,
        order_type=<OrderType.ROD: 'ROD'>
    ),
    status=OrderStatus(
        id='fa0bc4c8',
        status=<Status.PendingSubmit: 'PendingSubmit'>,
        status_code='00',
        order_datetime=datetime.datetime(2023, 9, 11, 8, 1, 23, 168095),
        deals=[]
    )
)
'''
```

### contract

### **Order Attributes**

- `price` (`float` or `int`): the price of order
- `quantity` (`int`): the quantity of order
- `action` (`str`): order action to buy or sell
    - {Buy, Sell}
- `price_type` (`str`): pricing type of order
    - {LMT, MKT, MKP} (限價、市價、範圍市價)
- `order_type` (`str`): the type of order
    - {ROD, IOC, FOK} (掛單到收盤，允許部分成交，全部成交否則取消)
- `order_cond` (`str`): order condition stock only
    - {Cash, MarginTrading, ShortSelling} (現股、融資、融券)
- `order_lot` (`str`): the type of order
    - {Common, Fixing, Odd, IntradayOdd} (整股、定盤、盤後零股、盤中零股)
    

> `daytrade_short` {`bool`}: the type of first sell
{True, False}
> 
> 
> `custom_field` {`str`}: memo field, only letters and numbers are allowed, and the maximum length is 6.
> `account` (:`obj`:Account): which account to place this order
> `ca` (`binary`): the ca of this order
>