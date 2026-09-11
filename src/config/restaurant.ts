/* ==========================================================================
   ملف بيانات المطعم (SINGLE SOURCE OF TRUTH)
   --------------------------------------------------------------------------
   هذا الملف هو المصدر الأساسي لبيانات وهوية ونصوص المطعم،
   ويعمل أيضاً كقاعدة بيانات افتراضية (Fallback) في حال عدم ربط Supabase.
   ========================================================================== */

export type MenuMode = "display_only" | "direct_whatsapp" | "cart_orders";
export type OrderMode = "delivery" | "display";
export type CheckoutMethod = "website" | "whatsapp" | "both";
export type SiteMode = "display" | "delivery" | "both";

export type OrderStatus = "pending" | "preparing" | "out_for_delivery" | "completed" | "cancelled";
export type OrderSource = "طلب من الموقع" | "طلب من واتساب" | "طلب مباشر";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  pin?: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CustomerLocation {
  lat: number;
  lng: number;
  mapsUrl: string;
  notes?: string;
  addressTitle?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  createdAt: string;
  items: OrderItem[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerLocation?: CustomerLocation;
  notes?: string;
  orderSource: OrderSource;
  status: OrderStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedAt?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  stat?: string;
  statLabel?: string;
}

export interface Discount {
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
  calories?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  discount?: Discount;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface DeliveryInfo {
  estimatedTime: string;
  coverage: string;
  minOrder?: string;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  items: MenuItem[];
}

export interface RestaurantConfig {
  name: string;
  tagline: string;
  description: string;
  currency: string;
  currencyPosition: "before" | "after";
  logo: string;
  heroImage: string;
  heroImages?: string[];
  spotlightItemId?: string;
  deliveryInfo?: DeliveryInfo;
  faq?: FaqItem[];
  menuMode: MenuMode;
  orderMode: OrderMode;
  checkoutMethod: CheckoutMethod;
  siteMode?: SiteMode;
  showcaseSection?: {
    badge: string;
    title: string;
    subtitle: string;
    items: FeatureItem[];
  };
  contact: {
    phone: string;
    whatsappNumber: string;
    whatsappMessagePrefix: string;
  };
  location: {
    address: string;
    city: string;
    googleMapsUrl: string;
  };
  workingHours: {
    days: string;
    hours: string;
  }[];
  isOpenStatus: {
    show: boolean;
    textOpen: string;
    textClosed: string;
    defaultStatus: "open" | "closed";
  };
  socialLinks: {
    instagram?: string;
    snapchat?: string;
    tiktok?: string;
    twitter?: string;
    facebook?: string;
  };
  uiTexts: {
    heroBadge: string;
    searchPlaceholder: string;
    allCategories: string;
    orderOnWhatsApp: string;
    generalOrderWhatsApp: string;
    viewDetails: string;
    caloriesLabel: string;
    workingHoursTitle: string;
    locationTitle: string;
    socialMediaTitle: string;
    contactTitle: string;
    rightsReserved: string;
    noResultsFound: string;
    noResultsDesc: string;
    closeModal: string;
    availableBadge: string;
    unavailableBadge: string;
    menuSectionTitle: string;
    menuSectionSubtitle: string;
    quickContactCall: string;
    quickDirections: string;
    categoryItemCountSuffix: string;
    poweredBy: string;
    addToCart: string;
    addedToCart: string;
    viewCart: string;
    cartTitle: string;
    emptyCart: string;
    emptyCartDesc: string;
    subtotal: string;
    totalDiscount: string;
    totalPrice: string;
    checkoutViaWhatsApp: string;
    customerNameLabel: string;
    customerNamePlaceholder: string;
    customerPhoneLabel: string;
    customerPhonePlaceholder: string;
    customerAddressLabel: string;
    customerAddressPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    clearCart: string;
    originalPrice: string;
    discountBadge: string;
    itemsCount: string;
    orderNowBtn?: string;
    viewMenuBtn?: string;
    whyUsTitle?: string;
    whyUsSubtitle?: string;
    bestSellersTitle?: string;
    bestSellersSubtitle?: string;
    spotlightBadge?: string;
    deliveryTitle?: string;
    deliverySubtitle?: string;
    faqTitle?: string;
    faqSubtitle?: string;
  };
  categories: Category[];
}

export const restaurantData: RestaurantConfig = {
  // 1. هوية المطعم ومعلومات الـ SEO
  name: "جكن اكسبريس - فلسطين",
  tagline: "سلسلة مطاعم للوجبات السريعة تقدّم أطباق الدجاج المقلي والريزو والساندويشات",
  description: "سلسلة مطاعم للوجبات السريعة تقدّم أطباق الدجاج المقلي، الريزو، الساندويشات، والبيتزا بطعم مميز",
  currency: "د.ع",
  currencyPosition: "after",

  // نمط المنيو الافتراضي (سلة وطلبات)
  menuMode: "cart_orders",

  // نمط التحكم بالطلب والعرض: "delivery" (إتاحة أزرار الطلب والواتساب) أو "display" (عرض الأسعار فقط كقائمة رقمية دون أزرار طلب)
  orderMode: "delivery",

  // نمط الموقع الشامل: "display" (عرض فقط) | "delivery" (توصيل فقط) | "both" (كلاهما - نظام صفحتين)
  siteMode: "delivery",

  // خيار إتمام الطلب في السلة: "website" (عبر الموقع فقط) | "whatsapp" (عبر واتساب فقط) | "both" (الاثنان معاً)
  checkoutMethod: "both",

  // سكشن العرض والمميزات التفاعلية (ما وراء النكهة / القرمشة)
  showcaseSection: {
    badge: "سر التميز والجودة 🔥",
    title: "ما وراء القرمشة والنكهة الذهبية",
    subtitle: "نعتني بأدق التفاصيل من اختيار الدجاج الطازج وحتى التتبيلة الخاصة المقرمشة لتصلك بأعلى معايير اللذة",
    items: [
      {
        id: "feat_1",
        title: "دجاج محلي طازج 100%",
        description: "توريد يومي طازج وموثوق بدون أي تجميد مسبق لضمان العصارة والطراوة.",
        icon: "🍗",
        stat: "100%",
        statLabel: "طازج يومياً",
      },
      {
        id: "feat_2",
        title: "خلطة توابل سرية",
        description: "خلطة بهارات حصرية ومبتكرة تمنح الدجاج نكهة كرسبي لا تُقاوم.",
        icon: "✨",
        stat: "+12",
        statLabel: "بهار وتتبيلة خاصة",
      },
      {
        id: "feat_3",
        title: "قرمشة استثنائية",
        description: "قلي بدرجات حرارة محسوبة بدقة للحصول على قرمشة ذهبية وخفيفة على المعدة.",
        icon: "🔥",
        stat: "100%",
        statLabel: "قرمشة ذهبية",
      },
      {
        id: "feat_4",
        title: "تجهيز فوري وسريع",
        description: "تحضير فوري عند الطلب لنضمن وصول الوجبة ساخنة ومقرمشة إلى طاولتك أو باب بيتك.",
        icon: "⚡",
        stat: "15-20",
        statLabel: "دقيقة متوسط التجهيز",
      },
    ],
  },

  // 2. صور الهوية
  logo: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=300&q=80",
  heroImage: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1600&q=80",
  heroImages: [
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80", // دجاج مقلي كرسبي
    "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80", // ساندويش فايرفايتر
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80", // ريزو دجاج مميز
  ],

  // الصنف المميز لسكشن السبوتلايت
  spotlightItemId: "riz_6",

  // معلومات خدمة التوصيل
  deliveryInfo: {
    estimatedTime: "25 - 40 دقيقة",
    coverage: "كافة مناطق بغداد والمناطق المجاورة",
    minOrder: "10,000 د.ع",
    note: "توصيل سريع ساخن في حقائب حرارية مخصصة للحفاظ على القرمشة",
  },

  // الأسئلة الشائعة
  faq: [
    {
      question: "كيف يمكنني تثبيت طلبي؟",
      answer: "بكل بساطة، اختر وجباتك المفضلة واضغط على زر 'اطلب الآن' ليتم فتح محادثة واتساب مباشرة مع كامل تفاصيل طلبك وعنوانك للتأكيد الفوري.",
    },
    {
      question: "ما هي أوقات استقبال طلبات التوصيل؟",
      answer: "نستقبل طلباتكم طيلة أيام الأسبوع من الساعة 11:00 صباحاً وحتى الساعة 02:00 بعد منتصف الليل.",
    },
    {
      question: "هل الدجاج المستخدم طازج أم مجمد؟",
      answer: "نعتمد بنسبة 100% على الدجاج المحلي الطازج المورد يومياً، والمتبل بخلطتنا السرية دون أي تجميد مسبق.",
    },
    {
      question: "كم يستغرق وصول الطلب؟",
      answer: "متوسط وقت التجهيز والتوصيل يتراوح بين 25 إلى 40 دقيقة بحسب موقعك، وتصلك الوجبة ساخنة ومقرمشة.",
    },
  ],

  // 3. أرقام الاتصال والواتساب
  contact: {
    phone: "07727177249",
    whatsappNumber: "9647727177249",
    whatsappMessagePrefix: "مرحباً جكن اكسبريس 🍗، أود طلب الوجبة التالية من المنيو:",
  },

  // 4. العنوان وموقع الخريطة
  location: {
    address: "9C75+WJ8، بغداد",
    city: "بغداد",
    googleMapsUrl: "#",
  },

  // 5. مواعيد وساعات الدوام
  workingHours: [
    { days: "طيلة أيام الأسبوع", hours: "11:00 صباحاً - 02:00 صباحاً" },
  ],

  // 6. شارة حالة العمل
  isOpenStatus: {
    show: true,
    textOpen: "مفتوح الآن ويستقبل طلباتكم 🟢",
    textClosed: "مغلق حالياً 🔴",
    defaultStatus: "open",
  },

  // 7. حسابات التواصل الاجتماعي
  socialLinks: {
    facebook: "https://web.facebook.com/chicken.express.iraq/?locale=ar_AR&_rdc=1&_rdr#",
    instagram: "https://www.instagram.com/chicken_express_iraq/?hl=ar",
  },

  // 8. القاموس الكامل لجميع نصوص الواجهة
  uiTexts: {
    heroBadge: "طعم مقرمش ومميز يومياً ✨",
    searchPlaceholder: "ابحث عن ساندويش، ريزو، وجبات كرسبي، بيتزا...",
    allCategories: "الكل",
    orderOnWhatsApp: "طلب سريع",
    generalOrderWhatsApp: "اطلب مباشرة عبر واتساب",
    viewDetails: "تفاصيل الصنف",
    caloriesLabel: "سعرة",
    workingHoursTitle: "ساعات العمل واستقبال الطلبات",
    locationTitle: "موقعنا",
    socialMediaTitle: "تابعنا على منصات التواصل",
    contactTitle: "تواصل معنا مباشرة",
    rightsReserved: "جميع الحقوق محفوظة",
    noResultsFound: "لم يتم العثور على نتائج!",
    noResultsDesc: "جرّب البحث باسم وجبة أخرى أو استكشف الأقسام أعلاه.",
    closeModal: "إغلاق",
    availableBadge: "متوفر الآن",
    unavailableBadge: "نفدت الكمية",
    menuSectionTitle: "قائمة الطعام والوجبات",
    menuSectionSubtitle: "أشهى وجبات الدجاج المقلي المقرمش، الساندويشات والريزو بنكهات مميزة",
    quickContactCall: "اتصال مباشر",
    quickDirections: "عرض الموقع",
    categoryItemCountSuffix: "أصناف",
    poweredBy: "نظام منيو المطاعم الذكي",
    addToCart: "أضف للسلة",
    addedToCart: "تمت الإضافة ✓",
    viewCart: "عرض السلة",
    cartTitle: "سلة الطلبات",
    emptyCart: "السلة فارغة حالياً",
    emptyCartDesc: "اختر وجباتك المفضلة من القائمة وأضفها للسلة لنجهزها لك بكل حب.",
    subtotal: "المجموع الفرعي",
    totalDiscount: "إجمالي الخصم",
    totalPrice: "المجموع النهائي",
    checkoutViaWhatsApp: "إرسال وإتمام الطلب عبر واتساب",
    customerNameLabel: "اسمك الكريم",
    customerNamePlaceholder: "أدخل اسمك هنا...",
    customerPhoneLabel: "رقم الجوال",
    customerPhonePlaceholder: "07xxxxxxxx",
    customerAddressLabel: "العنوان أو رقم الطاولة",
    customerAddressPlaceholder: "مثال: المنطقة، الشارع، أو داخل الصالة...",
    notesLabel: "أي ملاحظات إضافية على الطلب؟",
    notesPlaceholder: "مثال: بدون مايونيز، زيادة شطة، كاتشب إضافي...",
    clearCart: "تفريغ السلة",
    originalPrice: "السعر قبل الخصم",
    discountBadge: "خصم",
    itemsCount: "وجبات",
    orderNowBtn: "اطلب الآن",
    viewMenuBtn: "قائمة الطعام",
    whyUsTitle: "ليش تختار جكن اكسبريس؟",
    whyUsSubtitle: "أعلى معايير الجودة والقرمشة الذهبية بطعم لا يُنسى",
    bestSellersTitle: "الأكثر طلباً 🔥",
    bestSellersSubtitle: "أشهى وجباتنا المفضلة التي يعشقها زبائننا يومياً",
    spotlightBadge: "وجبة الأسبوع الخاصة ⭐",
    deliveryTitle: "توصيل سريع ومقرمش لباب بيتك 🛵",
    deliverySubtitle: "وجبتك المفضلة توصلك ساخنة في أسرع وقت وبأعلى جودة",
    faqTitle: "الأسئلة الشائعة 🤔",
    faqSubtitle: "كل ما تريد معرفته عن خدماتنا، طلباتنا، وجودة أطباقنا",
  },

  // 9. الأقسام والأصناف والوجبات
  categories: [
    {
      id: "sandwiches",
      name: "ساندويشات",
      icon: "🥪",
      items: [
        {
          id: "sand_1",
          categoryId: "sandwiches",
          name: "ساندويش فايرفايتر",
          description: "دجاج كرسبي، صوص حسب الرغبة، خس، شرائح هالبينو، بطاطا مقلية وبيبسي.",
          price: 6000,
          image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80",
          isAvailable: true,
          isFeatured: true,
        },
        {
          id: "sand_2",
          categoryId: "sandwiches",
          name: "ساندويش فيلر",
          description: "خبز فرنسي، قطع دجاج كرسبي، صوص، خس، طماطم، بطاطا مقلية وبيبسي.",
          price: 6000,
          image: "/im/ساندويش فيلر.png",
          isAvailable: true,
        },
        {
          id: "sand_3",
          categoryId: "sandwiches",
          name: "ساندويش تويستر",
          description: "خبز تورتيلا طازج مع شرائح دجاج مشوي وصوص حسب الرغبة، خس طازج، طماطم وبطاطا مقلية ذهبية.",
          price: 5000,
          image: "/im/ساندويش تويستر.png",
          isAvailable: true,
        },
        {
          id: "sand_4",
          categoryId: "sandwiches",
          name: "ساندويش مايتي زنجر",
          description: "قطعتان من دجاج الزنجر الكرسبي، خس، صوص حسب الرغبة، جبن، بطاطا مقلية وبيبسي.",
          price: 8000,
          image: "/im/ساندويش مايتي زنجر.png",
          badge: "حجم كبير 🔥",
          isAvailable: true,
          isFeatured: true,
        },
        {
          id: "sand_5",
          categoryId: "sandwiches",
          name: "ساندويش زنجر",
          description: "قطعة واحدة من دجاج الزنجر الكرسبي، خس، صوص، بطاطا مقلية وبيبسي.",
          price: 6000,
          image: "/im/ساندويش زنجر.png",
          isAvailable: true,
        },
        {
          id: "sand_6",
          categoryId: "sandwiches",
          name: "ساندويش ميغا ميل",
          description: "خبز تورتيلا، 3 قطع ستربس دجاج، جبن، خس، طماطم، بطاطا مقلية وبيبسي.",
          price: 6000,
          image: "/im/ساندويش ميغا ميل.png",
          isAvailable: true,
        },
        {
          id: "sand_7",
          categoryId: "sandwiches",
          name: "ساندويش سوبريم",
          description: "3 قطع ستربس، صوص حسب الرغبة، خس، جبن، ديك رومي، بطاطا مقلية وبيبسي.",
          price: 7000,
          image: "/im/ساندويش سوبريم.png",
          isAvailable: true,
        },
      ],
    },
    {
      id: "salads",
      name: "سلطات",
      icon: "🥗",
      items: [
        {
          id: "sal_1",
          categoryId: "salads",
          name: "سلطة سيزر",
          description: "فيليه دجاج، طماطم، خس وصوص سيزر.",
          price: 5000,
          image: "/im/سلطة سيزر.png",
          isAvailable: true,
        },
      ],
    },
    {
      id: "strips_meals",
      name: "وجبات ستربس",
      icon: "🍗",
      items: [
        {
          id: "str_1",
          categoryId: "strips_meals",
          name: "وجبة 5 قطع ستربس",
          description: "5 قطع صدر دجاج كرسبي، صوص ثوم، كول سلو، خبز وبيبسي.",
          price: 9500,
          image: "/im/وجبة 5 قطع ستربس.png",
          isAvailable: true,
        },
        {
          id: "str_2",
          categoryId: "strips_meals",
          name: "وجبة 3 قطع ستربس",
          description: "3 قطع صدر دجاج كرسبي، صوص ثوم، كول سلو، صمون وبيبسي.",
          price: 7000,
          image: "/im/وجبة 3 قطع ستربس.png",
          isAvailable: true,
        },
        {
          id: "str_3",
          categoryId: "strips_meals",
          name: "جمبو ستربس",
          description: "16 قطعة صدر دجاج كرسبي، صوص ثوم، كرنب، صمون وبيبسي.",
          price: 32000,
          image: "/im/جمبو ستربس.png",
          badge: "عائلي كبير 🌟",
          isAvailable: true,
        },
        {
          id: "str_4",
          categoryId: "strips_meals",
          name: "وجبة كرسبي ستربس",
          description: "قطعتان صدر دجاج كرسبي وقطعتان دجاج كرسبي، صوص ثوم، كرنب، صمون وبيبسي.",
          price: 10000,
          image: "/im/وجبة كرسبي ستربس.png",
          isAvailable: true,
        },
        {
          id: "str_5",
          categoryId: "strips_meals",
          name: "فاميلي ستربس",
          description: "14 قطعة صدر دجاج كرسبي، صوص ثوم، كرنب، صمون وبيبسي.",
          price: 25000,
          image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
          badge: "عائلي 👨‍👩‍👧‍👦",
          isAvailable: true,
        },
      ],
    },
    {
      id: "appetizers",
      name: "مقبلات",
      icon: "🍟",
      items: [
        {
          id: "app_1",
          categoryId: "appetizers",
          name: "أونيون رينغز",
          description: "حلقات بصل كرسبي مقرمشة وذهبية.",
          price: 3000,
          image: "/im/أونيون رينغز.png",
          isAvailable: true,
        },
        {
          id: "app_2",
          categoryId: "appetizers",
          name: "ناغتس",
          description: "قطع ناغتس دجاج كرسبي مقرمشة ولذيذة.",
          price: 3000,
          image: "/im/ناغتس.png",
          isAvailable: true,
        },
        {
          id: "app_3",
          categoryId: "appetizers",
          name: "طبق مقبلات مشكل عائلي",
          description: "8 أنواع متنوعة ومختارة من المقبلات الشهية.",
          price: 8000,
          image: "/im/طبق مقبلات مشكل عائلي.png",
          isAvailable: true,
        },
        {
          id: "app_4",
          categoryId: "appetizers",
          name: "طبق مقبلات مشكل كبير",
          description: "5 أنواع متنوعة ومختارة من المقبلات الشهية.",
          price: 6000,
          image: "/im/طبق مقبلات مشكل كبير.png",
          isAvailable: true,
        },
      ],
    },
    {
      id: "italian_saj",
      name: "صاج إيطالي",
      icon: "🌯",
      items: [
        {
          id: "saj_1",
          categoryId: "italian_saj",
          name: "صاج دجاج إيطالي",
          description: "عجينة صاج إيطالية، شاورما دجاج، ذرة، جبن وصوص، تقدم مع بطاطا مقلية وبيبسي.",
          price: 7000,
          image: "/im/صاج دجاج إيطالي.png",
          isAvailable: true,
        },
        {
          id: "saj_2",
          categoryId: "italian_saj",
          name: "صاج لحم إيطالي",
          description: "عجينة صاج إيطالية، شاورما لحم، بطاطا مقلية، ذرة، جبن وصوص، تقدم مع بطاطا مقلية وبيبسي.",
          price: 8000,
          image: "/im/صاج لحم إيطالي.png",
          isAvailable: true,
        },
        {
          id: "saj_3",
          categoryId: "italian_saj",
          name: "صاج دجاج إكسبريس إيطالي",
          description: "صاج إيطالي، دجاج وجبن، يقدم مع بطاطا مقلية وبيبسي.",
          price: 8000,
          image: "/im/صاج دجاج إكسبريس إيطالي.png",
          isAvailable: true,
        },
      ],
    },
    {
      id: "crispy_meals",
      name: "وجبات كرسبي",
      icon: "🍗",
      items: [
        {
          id: "cr_1",
          categoryId: "crispy_meals",
          name: "وجبة كرسبي قطعتان",
          description: "قطعتان دجاج كرسبي، صوص ثوم، كول سلو، صمون وبيبسي.",
          price: 7000,
          image: "/im/وجبة كرسبي قطعتان.png",
          isAvailable: true,
        },
        {
          id: "cr_2",
          categoryId: "crispy_meals",
          name: "جمبو فاميلي كرسبي ميل",
          description: "14 قطعة كنتاكي، 14 صمون، 4 صوص ثوم، 4 كرنب، بيبسي عائلي وبطاطا مقلية عائلية.",
          price: 32000,
          image: "/im/جمبو فاميلي كرسبي ميل.png",
          badge: "عائلي كبير 🌟",
          isAvailable: true,
        },
        {
          id: "cr_3",
          categoryId: "crispy_meals",
          name: "وجبة كرسبي 3 قطع",
          description: "3 قطع دجاج كرسبي، صوص ثوم، كول سلو، خبز وبيبسي.",
          price: 9000,
          image: "/im/وجبة كرسبي 3 قطع.png",
          isAvailable: true,
        },
        {
          id: "cr_4",
          categoryId: "crispy_meals",
          name: "فاميلي كرسبي ميل",
          description: "10 قطع كنتاكي، 10 صمون، 3 صوص ثوم، 3 كرنب، بيبسي عائلي وبطاطا مقلية عائلية.",
          price: 25000,
          image: "/im/فاميلي كرسبي ميل.png",
          badge: "عائلي 👨‍👩‍👧‍👦",
          isAvailable: true,
        },
      ],
    },
    {
      id: "fries",
      name: "بطاطا",
      icon: "🍟",
      items: [
        {
          id: "fr_1",
          categoryId: "fries",
          name: "فينجريتو",
          description: "كمية بطاطا مقلية مع قطع ستربس دجاج، صوص جبن شيدر، صوص باربكيو وصوص أعشاب.",
          price: 6000,
          image: "/im/فينجريتو.png",
          badge: "مميز 🔥",
          isAvailable: true,
        },
        {
          id: "fr_2",
          categoryId: "fries",
          name: "بطاطا بالجبن",
          description: "بطاطا مقلية ذهبية مع صوص جبن غني ولذيذ.",
          price: 3000,
          image: "/im/بطاطا بالجبن.png",
          isAvailable: true,
        },
        {
          id: "fr_3",
          categoryId: "fries",
          name: "بطاطا باربكيو",
          description: "بطاطا مقلية مقرمشة مغطاة بصوص الباربكيو المدخن.",
          price: 3000,
          image: "/im/بطاطا باربكيو.png",
          isAvailable: true,
        },
        {
          id: "fr_4",
          categoryId: "fries",
          name: "بطاطا هالبينو",
          description: "بطاطا مقلية مقرمشة مع قطع فلفل هالبينو حار وصوص خاص.",
          price: 3000,
          image: "/im/بطاطا هالبينو.png",
          badge: "حار 🌶️",
          isAvailable: true,
        },
      ],
    },
    {
      id: "pizza",
      name: "بيتزا",
      icon: "🍕",
      items: [
        {
          id: "piz_1",
          categoryId: "pizza",
          name: "بيتزا تشيكن إكسبريس",
          description: "عجينة بيتزا خاصة محشوة الأطراف، صوص بيتزا، شاورما لحم، شاورما دجاج، مكعبات دجاج كرسبي، خضار، زيتون، جبن كلاسيك وجبن موزاريلا.",
          price: 16000,
          image: "/im/بيتزا تشيكن إكسبريس.png",
          badge: "توقيع المطعم 🌟",
          isAvailable: true,
        },
      ],
    },
    {
      id: "rizo",
      name: "ريزو",
      icon: "🍚",
      items: [
        {
          id: "riz_1",
          categoryId: "rizo",
          name: "ريزو باربكيو",
          description: "أرز مبهر، قطع دجاج مقرمشة، صوص باربكيو مدخن وصوص حسب الرغبة.",
          price: 6500,
          image: "/im/ريزو باربكيو.png",
          isAvailable: true,
        },
        {
          id: "riz_2",
          categoryId: "rizo",
          name: "ريزو مكس",
          description: "أرز مبهر، قطع دجاج مقرمشة وصوص مكس خاص.",
          price: 7500,
          image: "/im/ريزو مكس.png",
          isAvailable: true,
        },
        {
          id: "riz_3",
          categoryId: "rizo",
          name: "ريزو بالجبن",
          description: "أرز مبهر، قطع دجاج مقرمشة، صوص جبن شيدر وصوص حسب الرغبة.",
          price: 6500,
          image: "/im/ريزو بالجبن.png",
          isAvailable: true,
        },
        {
          id: "riz_4",
          categoryId: "rizo",
          name: "ريزو عادي",
          description: "أرز مبهر كلاسيكي، قطع دجاج مقرمشة وصوص حسب الرغبة.",
          price: 6000,
          image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
          isAvailable: true,
        },
        {
          id: "riz_5",
          categoryId: "rizo",
          name: "ريزو هالبينو",
          description: "أرز مبهر، قطع دجاج مقرمشة، فلفل هالبينو حار وصوص خاص.",
          price: 6500,
          image: "/im/ريزو هالبينو.png",
          badge: "حار 🌶️",
          isAvailable: true,
        },
        {
          id: "riz_6",
          categoryId: "rizo",
          name: "توب ريزو",
          description: "طبق أرز فاخر مع قطع دجاج كرسبي مضافة لصوص خاص من جكن اكسبريس.",
          price: 6500,
          image: "/im/توب ريزو.png",
          badge: "الأكثر طلباً 🔥",
          isAvailable: true,
          isFeatured: true,
        },
      ],
    },
    {
      id: "new_items",
      name: "أصناف جديدة",
      icon: "✨",
      items: [
        {
          id: "new_1",
          categoryId: "new_items",
          name: "برو تندر",
          description: "قطعة دجاج تندر كرسبي مع موزاريلا مبرشة، شريحة جبن، شريحة ديك رومي طازجة، خس أخضر وصوص خاص لذيذ.",
          price: 7000,
          image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
          badge: "جديد ⚡",
          isAvailable: true,
          isFeatured: true,
        },
      ],
    },
  ],
};
