// Клієнтський скрипт
const toCurrency = price => {
    return new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency'
    }).format(price)
};
// Редактуємо ціну в красивий вигляд
document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent);
});

const toDate = date => {
    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
};
// Редактуємо дату в красивий вигляд
document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent);
});



// Робимо EventListener для видалення курсу з корзини по кнопці
const $cart = document.querySelector('#cart');
// Перевіряємо чи є елемент з таким id, бо не на всіх сторінках він є
if ($cart) {
    $cart.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id;
            const csrf = event.target.dataset.csrf;
            
            // Викликамо AJAX-запит з клієнта на сервер
            fetch('/cart/remove/' + id, {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN': csrf
                },
            }).then(res => res.json())
              .then(cart => {
                // Робимо динамічну сторінку корзини
                if (cart.courses.length) {
                    const html = cart.courses.map(c => {
                        return `
                        <tr>
        
                            <td>${c.title}</td>
                            <td>${c.count}</td>
                            <td>
                                <button class="btn btn-small red js-remove" data-id="${c.id}">Delete</button>
                            </td>
                        </tr>
                        `
                    }).join('');
                    $cart.querySelector('tbody').innerHTML = html;
                    $cart.querySelector('.price').textContent = toCurrency(cart.price);
                } else {
                    $cart.innerHTML = '<h3>Cart is empty YET :(</h3>'
                }
              });
        }
    })
}

// Ініціалізація табів для авторизації
M.Tabs.init(document.querySelectorAll('.tabs'));