// MSD BACKS AND SWEETS — Product Data
const PRODUCTS = {
  milk: {
    id: 'milk',
    name: 'Milk Products',
    icon: '🥛',
    emoji: '☕',
    color: '#F4A261',
    timeRestricted: false,
    items: [
      { id: 'm1', name: 'Masala Tea', price: 15, desc: 'Hot spiced milk tea', emoji: '☕', popular: true },
      { id: 'm2', name: 'Bhadam Milk', price: 30, desc: 'Rich almond flavored milk', emoji: '🥛', popular: true },
      { id: 'm3', name: 'Boost', price: 25, desc: 'Energy health drink', emoji: '💪' },
      { id: 'm4', name: 'Horlicks', price: 25, desc: 'Nourishing malt drink', emoji: '🌾' },
      { id: 'm5', name: 'Black Tea', price: 10, desc: 'Classic strong black tea', emoji: '🍵' },
      { id: 'm6', name: 'Ginger Tea', price: 15, desc: 'Fresh ginger spiced tea', emoji: '🍵', popular: true },
      { id: 'm7', name: 'Plain Milk', price: 20, desc: 'Fresh full cream milk', emoji: '🥛' },
      { id: 'm8', name: 'Ovaltine', price: 25, desc: 'Chocolate malt drink', emoji: '🍫' },
    ]
  },
  drinks: {
    id: 'drinks',
    name: 'Choose (Drinks)',
    icon: '🥤',
    emoji: '🧊',
    color: '#2EC4B6',
    timeRestricted: false,
    subCategories: {
      backed: {
        name: 'Backed / Bottled',
        items: [
          { id: 'd1', name: 'Sprite', price: 20, desc: 'Chilled lemon fizz drink', emoji: '🟢', popular: true },
          { id: 'd2', name: 'Mango Drink', price: 25, desc: 'Sweet mango flavored drink', emoji: '🥭' },
          { id: 'd3', name: 'Bhadam Cooling', price: 35, desc: 'Cooling almond sherbet', emoji: '💙', popular: true },
          { id: 'd4', name: 'Pannir Soda', price: 20, desc: 'Rose flavored soda', emoji: '🌹' },
          { id: 'd5', name: 'Limca', price: 20, desc: 'Lime & lemon soda', emoji: '🍋' },
          { id: 'd6', name: 'Thumbs Up', price: 20, desc: 'Strong cola drink', emoji: '👍' },
        ]
      },
      fresh: {
        name: 'Fresh Juices',
        items: [
          { id: 'd7', name: 'Modhulai Juice', price: 40, desc: 'Fresh pomegranate juice', emoji: '❤️', popular: true },
          { id: 'd8', name: 'Apple Juice', price: 35, desc: 'Fresh apple juice', emoji: '🍎' },
          { id: 'd9', name: 'Orange Juice', price: 35, desc: 'Fresh squeezed orange', emoji: '🍊', popular: true },
          { id: 'd10', name: 'Sathukudi Juice', price: 35, desc: 'Sweet lime juice', emoji: '🍋' },
          { id: 'd11', name: 'Watermelon Juice', price: 30, desc: 'Chilled watermelon', emoji: '🍉' },
          { id: 'd12', name: 'Grape Juice', price: 40, desc: 'Fresh grape juice', emoji: '🍇' },
        ]
      }
    }
  },
  snacks: {
    id: 'snacks',
    name: 'Snacks',
    icon: '🍿',
    emoji: '🥨',
    color: '#E76F51',
    timeRestricted: false,
    items: [
      { id: 's1', name: 'Murukku', price: 20, desc: 'Crispy rice flour snack', emoji: '🌀', popular: true },
      { id: 's2', name: 'Pakkoda', price: 25, desc: 'Crispy onion fritters', emoji: '🧅', popular: true },
      { id: 's3', name: 'Mixture', price: 20, desc: 'Spicy mixed namkeen', emoji: '🥜' },
      { id: 's4', name: 'Chev (Sev)', price: 20, desc: 'Thin crispy noodle snack', emoji: '🟡' },
      { id: 's5', name: 'Boonthi', price: 15, desc: 'Sweet or spicy gram flour drops', emoji: '🫧', popular: true },
      { id: 's6', name: 'Ribbon Pakoda', price: 20, desc: 'Ribbon shaped rice snack', emoji: '🎀' },
      { id: 's7', name: 'Maida Biscuit', price: 10, desc: 'Homemade flour biscuits', emoji: '🍪' },
      { id: 's8', name: 'Omapodi', price: 20, desc: 'Thin spicy sev with ajwain', emoji: '🟠' },
    ]
  },
  chocolates: {
    id: 'chocolates',
    name: 'Chocolates',
    icon: '🍫',
    emoji: '🍫',
    color: '#6D4C41',
    timeRestricted: false,
    items: [
      { id: 'c1', name: 'Dairy Milk', price: 20, desc: 'Classic creamy milk chocolate', emoji: '🍫', popular: true },
      { id: 'c2', name: '5 Star', price: 20, desc: 'Caramel & nougat bar', emoji: '⭐', popular: true },
      { id: 'c3', name: 'KitKat', price: 30, desc: 'Crispy wafer chocolate', emoji: '🍫' },
      { id: 'c4', name: 'Perk', price: 20, desc: 'Light chocolate wafer', emoji: '🟤' },
      { id: 'c5', name: 'Gems', price: 15, desc: 'Colorful chocolate drops', emoji: '🌈' },
      { id: 'c6', name: 'Munch', price: 10, desc: 'Crunchy rice chocolate', emoji: '🍫' },
      { id: 'c7', name: 'Butter Milk Chocolate', price: 25, desc: 'Creamy butter milk choc', emoji: '🧈' },
      { id: 'c8', name: 'Éclairs', price: 5, desc: 'Toffee chocolate candy', emoji: '🍬', popular: true },
    ]
  },
  cakes: {
    id: 'cakes',
    name: 'Cakes',
    icon: '🎂',
    emoji: '🎂',
    color: '#E91E8C',
    timeRestricted: false,
    items: [
      { id: 'ck1', name: 'Chocolate Cake', price: 350, desc: 'Rich dark chocolate layered cake', emoji: '🎂', popular: true, unit: '500g' },
      { id: 'ck2', name: 'Vanilla Cake', price: 300, desc: 'Light fluffy vanilla cream cake', emoji: '🎂', unit: '500g' },
      { id: 'ck3', name: 'Strawberry Cake', price: 380, desc: 'Fresh strawberry topped cake', emoji: '🍓', unit: '500g' },
      { id: 'ck4', name: 'Black Forest', price: 400, desc: 'Cherry & cream classic', emoji: '🍒', popular: true, unit: '500g' },
      { id: 'ck5', name: 'Butterscotch Cake', price: 350, desc: 'Crunchy butterscotch cream cake', emoji: '🍮', unit: '500g' },
      { id: 'ck6', name: 'Red Velvet', price: 420, desc: 'Classic red velvet with cream cheese', emoji: '❤️', unit: '500g' },
      { id: 'ck7', name: 'Pineapple Cake', price: 320, desc: 'Tropical pineapple fresh cream', emoji: '🍍', unit: '500g' },
      { id: 'ck8', name: '🎨 Customized Cake', price: 500, desc: 'Design your own special cake! (Contact us)', emoji: '✨', popular: true, unit: '1kg', customizable: true },
    ]
  },
  meals: {
    id: 'meals',
    name: 'Meals',
    icon: '🍽️',
    emoji: '🍛',
    color: '#43A047',
    timeRestricted: true,
    availableAfter: 18, // 6 PM
    items: [
      { id: 'ml1', name: 'Chicken Noodles', price: 80, desc: 'Spicy wok-tossed chicken noodles', emoji: '🍜', popular: true },
      { id: 'ml2', name: 'Chicken Rice', price: 90, desc: 'Flavored chicken fried rice', emoji: '🍚', popular: true },
      { id: 'ml3', name: 'Veg Noodles', price: 60, desc: 'Mixed vegetable noodles', emoji: '🍜' },
      { id: 'ml4', name: 'Veg Rice', price: 70, desc: 'Mixed vegetable fried rice', emoji: '🍚' },
      { id: 'ml5', name: 'Omelette', price: 40, desc: 'Fluffy egg omelette with veggies', emoji: '🍳', popular: true },
      { id: 'ml6', name: 'Egg Fried Rice', price: 70, desc: 'Classic egg fried rice', emoji: '🍳' },
      { id: 'ml7', name: 'Chicken Lollipop', price: 120, desc: 'Crispy spiced chicken lollipops', emoji: '🍗', popular: true },
      { id: 'ml8', name: 'Veg Kothu', price: 65, desc: 'Shredded parotta with vegetables', emoji: '🥘' },
    ]
  },
  junkfoods: {
    id: 'junkfoods',
    name: 'Junk Foods & Buns',
    icon: '🍞',
    emoji: '🥐',
    color: '#FB8C00',
    timeRestricted: false,
    items: [
      { id: 'j1', name: 'Veg Puff', price: 15, desc: 'Crispy pastry with veg filling', emoji: '🥧', popular: true },
      { id: 'j2', name: 'Egg Puff', price: 20, desc: 'Flaky puff with boiled egg', emoji: '🥚', popular: true },
      { id: 'j3', name: 'Roll Puff', price: 25, desc: 'Rolled pastry with spicy filling', emoji: '🌯' },
      { id: 'j4', name: 'Coconut Bun', price: 15, desc: 'Sweet bun with coconut filling', emoji: '🥥', popular: true },
      { id: 'j5', name: 'Sweet Bun', price: 10, desc: 'Soft sugar glazed bun', emoji: '🍞' },
      { id: 'j6', name: 'Cream Bun', price: 20, desc: 'Soft bun with cream filling', emoji: '🍮' },
      { id: 'j7', name: 'Masala Puff', price: 20, desc: 'Spicy masala puff pastry', emoji: '🌶️' },
      { id: 'j8', name: 'Chicken Puff', price: 30, desc: 'Flaky puff with chicken filling', emoji: '🍗', popular: true },
    ]
  },
  sweets: {
    id: 'sweets',
    name: 'Sweets',
    icon: '🍬',
    emoji: '🍯',
    color: '#AB47BC',
    timeRestricted: false,
    items: [
      { id: 'sw1', name: 'Gulab Jamun', price: 30, desc: 'Soft milk dumplings in syrup', emoji: '🟤', popular: true, unit: '3 pcs' },
      { id: 'sw2', name: 'Ladoo', price: 25, desc: 'Round gram flour sweet balls', emoji: '🟡', popular: true, unit: '2 pcs' },
      { id: 'sw3', name: 'Halwa', price: 40, desc: 'Semolina or carrot sweet', emoji: '🟠', unit: '1 cup' },
      { id: 'sw4', name: 'Barfi', price: 30, desc: 'Milk based fudge sweet', emoji: '⬜', unit: '2 pcs' },
      { id: 'sw5', name: 'Jalebi', price: 30, desc: 'Crispy syrup-soaked spirals', emoji: '🌀', popular: true, unit: '4 pcs' },
      { id: 'sw6', name: 'Rasgulla', price: 35, desc: 'Spongy cottage cheese balls in syrup', emoji: '⚪', unit: '3 pcs' },
      { id: 'sw7', name: 'Mysore Pak', price: 40, desc: 'Rich ghee gram flour sweet', emoji: '🟨', popular: true, unit: '2 pcs' },
      { id: 'sw8', name: 'Palgova', price: 35, desc: 'Milk-based traditional sweet', emoji: '🤍', unit: '100g' },
      { id: 'sw9', name: 'Adhirasam', price: 25, desc: 'Rice & jaggery deep fried sweet', emoji: '🍩', unit: '2 pcs' },
      { id: 'sw10', name: 'Kozhukattai', price: 30, desc: 'Steamed rice flour sweet', emoji: '🫓', unit: '3 pcs' },
    ]
  }
};

const SHOP_INFO = {
  name: 'MSD BACKS AND SWEETS',
  tagline: 'Freshness in Every Bite 🍞',
  address: 'Palayam to Trichy Main Road, Mylampatty, Karur District, Kadavur (TK) - 621301',
  phone: '+91 98765 43210',
  email: 'msdbacks@gmail.com',
  whatsapp: '919876543210',
  lat: 10.9601,
  lng: 78.0766,
  openHours: '6:00 AM – 11:00 PM',
  deliveryRadius: '10 km'
};

const DELIVERY_PERSONS = [
  { id: 'dp1', name: 'Rajan Kumar', phone: '9876501234', vehicle: 'TVS Apache', vehicleNo: 'TN-47-AB-1234', photo: '👷', rating: 4.8, lat: 10.9601, lng: 78.0766 },
  { id: 'dp2', name: 'Murugan S', phone: '9876502345', vehicle: 'Activa', vehicleNo: 'TN-47-CD-5678', photo: '🚴', rating: 4.6, lat: 10.9560, lng: 78.0710 },
  { id: 'dp3', name: 'Selvam K', phone: '9876503456', vehicle: 'Splendor', vehicleNo: 'TN-47-EF-9012', photo: '🏍️', rating: 4.9, lat: 10.9640, lng: 78.0820 },
];

window.PRODUCTS = PRODUCTS;
window.SHOP_INFO = SHOP_INFO;
window.DELIVERY_PERSONS = DELIVERY_PERSONS;
