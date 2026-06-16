const legacyProducts = window.PRODUCTS;
const legacyDeliveryPersons = window.DELIVERY_PERSONS;

export { PRODUCTS, DELIVERY_PERSONS };

const fallbackProducts = {
  milk: { id: 'milk', name: 'Milk Products', icon: '🥛', items: [
    { id: 'm1', name: 'Masala Tea', price: 15, desc: 'Hot spiced milk tea', emoji: '☕', popular: true },
    { id: 'm2', name: 'Bhadam Milk', price: 30, desc: 'Rich almond flavored milk', emoji: '🥛', popular: true },
    { id: 'm3', name: 'Boost', price: 25, desc: 'Energy health drink', emoji: '💪' },
    { id: 'm4', name: 'Horlicks', price: 25, desc: 'Nourishing malt drink', emoji: '🌾' },
    { id: 'm5', name: 'Black Tea', price: 10, desc: 'Classic strong black tea', emoji: '🍵' },
    { id: 'm6', name: 'Ginger Tea', price: 15, desc: 'Fresh ginger spiced tea', emoji: '🍵', popular: true }
  ]},
  drinks: { id: 'drinks', name: 'Choose (Drinks)', icon: '🥤', subCategories: {
    bottled: { name: 'Backed / Bottled', items: [
      { id: 'd1', name: 'Sprite', price: 20, desc: 'Chilled lemon fizz drink', emoji: '🟢', popular: true },
      { id: 'd2', name: 'Mango Drink', price: 25, desc: 'Sweet mango flavored drink', emoji: '🥭' },
      { id: 'd3', name: 'Bhadam Cooling', price: 35, desc: 'Cooling almond sherbet', emoji: '💙', popular: true }
    ]},
    fresh: { name: 'Fresh Juices', items: [
      { id: 'd7', name: 'Modhulai Juice', price: 40, desc: 'Fresh pomegranate juice', emoji: '❤️', popular: true },
      { id: 'd8', name: 'Apple Juice', price: 35, desc: 'Fresh apple juice', emoji: '🍎' },
      { id: 'd9', name: 'Orange Juice', price: 35, desc: 'Fresh squeezed orange', emoji: '🍊', popular: true }
    ]}
  }},
  snacks: { id: 'snacks', name: 'Snacks', icon: '🍿', items: [
    { id: 's1', name: 'Murukku', price: 20, desc: 'Crispy rice flour snack', emoji: '🌀', popular: true },
    { id: 's2', name: 'Pakkoda', price: 25, desc: 'Crispy onion fritters', emoji: '🧅', popular: true },
    { id: 's3', name: 'Mixture', price: 20, desc: 'Spicy mixed namkeen', emoji: '🥜' }
  ]},
  chocolates: { id: 'chocolates', name: 'Chocolates', icon: '🍫', items: [
    { id: 'c1', name: 'Dairy Milk', price: 20, desc: 'Classic creamy milk chocolate', emoji: '🍫', popular: true },
    { id: 'c2', name: '5 Star', price: 20, desc: 'Caramel & nougat bar', emoji: '⭐', popular: true },
    { id: 'c3', name: 'KitKat', price: 30, desc: 'Crispy wafer chocolate', emoji: '🍫' }
  ]},
  cakes: { id: 'cakes', name: 'Cakes', icon: '🎂', items: [
    { id: 'ck1', name: 'Chocolate Cake', price: 350, desc: 'Rich dark chocolate layered cake', emoji: '🎂', popular: true, unit: '500g' },
    { id: 'ck2', name: 'Vanilla Cake', price: 300, desc: 'Light fluffy vanilla cream cake', emoji: '🎂', unit: '500g' },
    { id: 'ck4', name: 'Black Forest', price: 400, desc: 'Cherry & cream classic', emoji: '🍒', popular: true, unit: '500g' },
    { id: 'ck8', name: '🎨 Customized Cake', price: 500, desc: 'Design your own special cake!', emoji: '✨', popular: true, unit: '1kg' }
  ]},
  meals: { id: 'meals', name: 'Meals', icon: '🍽️', timeRestricted: true, items: [
    { id: 'ml1', name: 'Chicken Noodles', price: 80, desc: 'Spicy wok-tossed chicken noodles', emoji: '🍜', popular: true },
    { id: 'ml2', name: 'Chicken Rice', price: 90, desc: 'Flavored chicken fried rice', emoji: '🍚', popular: true },
    { id: 'ml3', name: 'Veg Noodles', price: 60, desc: 'Mixed vegetable noodles', emoji: '🍜' }
  ]},
  junkfoods: { id: 'junkfoods', name: 'Junk Foods & Buns', icon: '🍞', items: [
    { id: 'j1', name: 'Veg Puff', price: 15, desc: 'Crispy pastry with veg filling', emoji: '🥧', popular: true },
    { id: 'j2', name: 'Egg Puff', price: 20, desc: 'Flaky puff with boiled egg', emoji: '🥚', popular: true },
    { id: 'j8', name: 'Chicken Puff', price: 30, desc: 'Flaky puff with chicken filling', emoji: '🍗', popular: true }
  ]},
  sweets: { id: 'sweets', name: 'Sweets', icon: '🍬', items: [
    { id: 'sw1', name: 'Gulab Jamun', price: 30, desc: 'Soft milk dumplings in syrup', emoji: '🟤', popular: true, unit: '3 pcs' },
    { id: 'sw2', name: 'Ladoo', price: 25, desc: 'Round gram flour sweet balls', emoji: '🟡', popular: true, unit: '2 pcs' },
    { id: 'sw7', name: 'Mysore Pak', price: 40, desc: 'Rich ghee gram flour sweet', emoji: '🟨', popular: true, unit: '2 pcs' }
  ]}
};

const fallbackDeliveryPersons = [
  { id: 'dp1', name: 'Rajan Kumar', phone: '9876501234' },
  { id: 'dp2', name: 'Murugan S', phone: '9876502345' },
  { id: 'dp3', name: 'Selvam K', phone: '9876503456' }
];

const PRODUCTS = legacyProducts || fallbackProducts;
const DELIVERY_PERSONS = legacyDeliveryPersons || fallbackDeliveryPersons;
