const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
  bar.addEventListener('click', () => {
    nav.classList.add('active');
  })
}

if (close) {
  close.addEventListener('click', () => {
    nav.classList.remove('active');
  })
}

//Shopping Cart
if (document.readyState == 'loading') {
  document.addEventListener('DOMContentLoaded', ready)
} else {
  ready()
}

function ready() {
  var removeCartItemButtons = document.getElementsByClassName('btn-danger')
  for (var i = 0; i < removeCartItemButtons.length; i++) {
    var button = removeCartItemButtons[i]
    button.addEventListener('click', removeCartItem) 
  }
  var quantityInputs = document.getElementsByClassName('cart-quantity')
  for (var i = 0; i < quantityInputs.length; i++) {
    var input =  quantityInputs[i]
    input.addEventListener('change', quantityChanged)
  }
  // Add Single Product to cart
  var addToCartButtons = document.getElementsByClassName('shop-item-buttton')
  // for more than 2 products on a same page
  for (var i = 0; i < addToCartButtons.length; i++) {
    var button = addToCartButtons[i]
    button.addEventListener('click', addToCartClicked)
  }

  document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)  
}

var stripeHandler = StripeCheckout.configure({
  key: stripePublicKey,
  locale: 'en',
  token: function(token) {
    console.log(token)
    var items = []
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
      for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity')[0]
        var quantity = quantityElement.value
        var id = cartRow.dataset.itemId
        items.push({
          id: id,
          quantity: quantity
        })
      }
      fetch('http://localhost:3000/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          stripeTokenId: token.id,
          items: items
        })
      }).then(function(res) {
        if(res.ok) 
        return res.json()
      }).then(function(data) {

        var cartItems = document.getElementsByClassName('cart-items')[0]
        while (cartItems.hasChildNodes()) {
          cartItems.removeChild(cartItems.firstChild)
        }
        updateCartTotal()
      }).catch(function(error) {
        console.log(error)
      })
  }
})

function purchaseClicked() {
  var priceElement = document.getElementsByClassName('cart-total')[0]
  var price = parseFloat(priceElement.innerText.replace('$', '')) * 100
  stripeHandler.open({
    amount: price
  })
}

function removeCartItem(event) {
  var buttonclicked = event.target
      buttonclicked.parentElement.parentElement.remove()
      updateCartTotal()
}

function quantityChanged (event) {
  var input = event.target
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1
  }
  updateCartTotal()
}

// Add item to Cart
function addToCartClicked (event) {
  var button = event.target
  var shopItem = button.parentElement
  var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
  var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
  var image = button.parentElement.parentElement
  var imageSrc = image.getElementsByClassName('shop-item-image')[0].src 
  var id = shopItem.dataset.itemId
  addItemToCart(title, price, imageSrc, id)
  updateCartTotal()
}

function addItemToCart(title, price, imageSrc, id) {
  var cartRow = document.createElement('tr') 
  cartRow.classList.add('cart-row')
  cartRow.dataset.itemId = id
  var cartItems = document.getElementsByClassName('cart-items')[0]
  var cartItemName = cartItems.getElementsByClassName('cart-item-title')
  for (var i = 0; i < cartItemName.length; i++) {
    if (cartItemName[i].innerText == title) {
      alert ('This item is already added to your cart!')
      return
    }
  }
  var cartrowConents = `
    <td><i class="far fa-times-circle btn-danger"></i><a href="#"></a></td>
    <td class="cart-item-image"><img src="${imageSrc}"></td>
    <td class="cart-item-title">${title}</td>
    <td class="cart-price">${price}</td>
    <td>
      <select>
        <option>Select Size</option>
        <option>Small</option>
        <option>medium</option>
        <option>Large</option>
        <option>XL</option>
        <option>XXL</option>
      </select>
    </td>
    <td><input type="number" value="1" class="cart-quantity"></td>`  
  cartRow.innerHTML = cartrowConents
  cartItems.append(cartRow)
  cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
  cartRow.getElementsByClassName('cart-quantity')[0].addEventListener('change', quantityChanged)
}


function updateCartTotal() {
  var cartItemContainer = document.getElementsByClassName('cart-items')[0]
  var cartRows = cartItemContainer.getElementsByClassName('cart-row')
  var total = 0
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i]
    var priceElement = cartRow.getElementsByClassName('cart-price')[0]
    var quantityElement = cartRow.getElementsByClassName('cart-quantity')[0]
    var price = parseFloat(priceElement.innerText.replace('$', ''))
    var quantity = quantityElement.value   
    total = total + (price * quantity)
  }
 
  total = Math.round(total * 100) / 100 
  document.getElementsByClassName('cart-subtotal')[0].innerText = total
  console.log(total)
  var ship = parseFloat(document.getElementsByClassName('shipping')[0].innerText)
  cartTotal = total + ship
  document.getElementsByClassName('cart-total')[0].innerText = cartTotal
  console.log(cartTotal)
}
  




