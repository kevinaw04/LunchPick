import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const restaurants = [
  {
    id: "rest-01",
    name: "Mediterranean Grill",
    cuisine: "Mediterranean",
    cuisineTags: JSON.stringify(["mediterranean", "greek", "healthy", "salads", "wraps"]),
    distanceMiles: 2.3,
    avgCostPerPerson: 12.4,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: true,
    cateringMinPeople: 10,
    openHours: JSON.stringify({ open: "10:30", close: "21:00" }),
    dietaryOptions: JSON.stringify(["vegetarian", "vegan", "gluten-free", "dairy-free", "halal"]),
    allergenInfo: JSON.stringify({ nuts: false, dairy: true, gluten: true, verified: true }),
    menuHighlights: JSON.stringify(["Hummus Plate", "Chicken Shawarma", "Falafel Bowl", "Greek Salad", "Lamb Gyro"]),
    rating: 4.7,
    imageEmoji: "🫒",
    address: "123 Olive Ave",
    phone: "555-0101",
  },
  {
    id: "rest-02",
    name: "Chipotle Mexican Grill",
    cuisine: "Mexican",
    cuisineTags: JSON.stringify(["mexican", "burritos", "tacos", "bowls", "fast-casual"]),
    distanceMiles: 1.1,
    avgCostPerPerson: 11.0,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: true,
    cateringMinPeople: 20,
    openHours: JSON.stringify({ open: "10:45", close: "22:00" }),
    dietaryOptions: JSON.stringify(["vegetarian", "vegan", "gluten-free", "dairy-free"]),
    allergenInfo: JSON.stringify({ nuts: false, dairy: true, gluten: true, verified: true }),
    menuHighlights: JSON.stringify(["Burrito Bowl", "Sofritas Bowl", "Carnitas Tacos", "Chips & Guac", "Veggie Burrito"]),
    rating: 4.3,
    imageEmoji: "🌯",
    address: "456 Burrito Blvd",
    phone: "555-0102",
  },
  {
    id: "rest-03",
    name: "Pizza Palace",
    cuisine: "Pizza",
    cuisineTags: JSON.stringify(["pizza", "italian", "pasta", "cheesy"]),
    distanceMiles: 0.8,
    avgCostPerPerson: 10.5,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: false,
    cateringMinPeople: 0,
    openHours: JSON.stringify({ open: "11:00", close: "23:00" }),
    dietaryOptions: JSON.stringify(["vegetarian"]),
    allergenInfo: JSON.stringify({ nuts: false, dairy: true, gluten: true, verified: true }),
    menuHighlights: JSON.stringify(["Pepperoni Pizza", "Margherita", "BBQ Chicken Pizza", "Garlic Bread", "Caesar Salad"]),
    rating: 4.1,
    imageEmoji: "🍕",
    address: "789 Dough St",
    phone: "555-0103",
  },
  {
    id: "rest-04",
    name: "Shake Shack",
    cuisine: "Burgers",
    cuisineTags: JSON.stringify(["burgers", "american", "shakes", "fries", "fast-casual"]),
    distanceMiles: 1.7,
    avgCostPerPerson: 14.0,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: false,
    cateringMinPeople: 0,
    openHours: JSON.stringify({ open: "10:30", close: "22:00" }),
    dietaryOptions: JSON.stringify(["vegetarian"]),
    allergenInfo: JSON.stringify({ nuts: true, dairy: true, gluten: true, verified: true }),
    menuHighlights: JSON.stringify(["ShackBurger", "SmokeShack", "Veggie Shack", "Crinkle Fries", "Shakes"]),
    rating: 4.5,
    imageEmoji: "🍔",
    address: "321 Burger Lane",
    phone: "555-0104",
  },
  {
    id: "rest-05",
    name: "Sweetgreen",
    cuisine: "Healthy / Salads",
    cuisineTags: JSON.stringify(["salads", "healthy", "bowls", "grain bowls", "vegan-friendly"]),
    distanceMiles: 1.4,
    avgCostPerPerson: 13.5,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: true,
    cateringMinPeople: 10,
    openHours: JSON.stringify({ open: "10:30", close: "21:00" }),
    dietaryOptions: JSON.stringify(["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"]),
    allergenInfo: JSON.stringify({ nuts: false, dairy: false, gluten: false, verified: true }),
    menuHighlights: JSON.stringify(["Harvest Bowl", "Kale Caesar", "Spicy Thai Salad", "Portobello Bowl", "Roasted Veggie"]),
    rating: 4.4,
    imageEmoji: "🥗",
    address: "654 Garden Way",
    phone: "555-0105",
  },
  {
    id: "rest-06",
    name: "Panda Express",
    cuisine: "Chinese / Asian",
    cuisineTags: JSON.stringify(["chinese", "asian", "noodles", "rice", "fast-casual"]),
    distanceMiles: 2.0,
    avgCostPerPerson: 9.5,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: true,
    cateringMinPeople: 15,
    openHours: JSON.stringify({ open: "10:30", close: "21:30" }),
    dietaryOptions: JSON.stringify(["vegetarian"]),
    allergenInfo: JSON.stringify({ nuts: true, dairy: false, gluten: true, verified: true }),
    menuHighlights: JSON.stringify(["Orange Chicken", "Kung Pao Chicken", "Chow Mein", "Fried Rice", "Mushroom Chicken"]),
    rating: 3.9,
    imageEmoji: "🥡",
    address: "987 Dragon Rd",
    phone: "555-0106",
  },
  {
    id: "rest-07",
    name: "Curry House Indian",
    cuisine: "Indian",
    cuisineTags: JSON.stringify(["indian", "curry", "naan", "rice", "spicy", "vegetarian-friendly"]),
    distanceMiles: 3.2,
    avgCostPerPerson: 13.0,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: true,
    cateringMinPeople: 10,
    openHours: JSON.stringify({ open: "11:00", close: "22:00" }),
    dietaryOptions: JSON.stringify(["vegetarian", "vegan", "gluten-free", "halal"]),
    allergenInfo: JSON.stringify({ nuts: true, dairy: true, gluten: false, verified: true }),
    menuHighlights: JSON.stringify(["Chicken Tikka Masala", "Saag Paneer", "Dal Makhani", "Biryani", "Garlic Naan"]),
    rating: 4.6,
    imageEmoji: "🍛",
    address: "147 Spice Market",
    phone: "555-0107",
  },
  {
    id: "rest-08",
    name: "Sushi Sakura",
    cuisine: "Japanese",
    cuisineTags: JSON.stringify(["japanese", "sushi", "ramen", "asian", "fish"]),
    distanceMiles: 4.1,
    avgCostPerPerson: 18.0,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: false,
    cateringMinPeople: 0,
    openHours: JSON.stringify({ open: "11:30", close: "21:00" }),
    dietaryOptions: JSON.stringify(["vegetarian", "gluten-free"]),
    allergenInfo: JSON.stringify({ nuts: false, dairy: false, gluten: true, verified: true }),
    menuHighlights: JSON.stringify(["California Roll", "Spicy Tuna Roll", "Salmon Sashimi", "Miso Ramen", "Veggie Roll"]),
    rating: 4.8,
    imageEmoji: "🍱",
    address: "258 Cherry Blossom St",
    phone: "555-0108",
  },
  {
    id: "rest-09",
    name: "Brisket Brothers BBQ",
    cuisine: "BBQ",
    cuisineTags: JSON.stringify(["bbq", "american", "smoky", "meat", "ribs", "brisket"]),
    distanceMiles: 2.8,
    avgCostPerPerson: 16.0,
    deliveryAvailable: false,
    pickupAvailable: true,
    cateringAvailable: true,
    cateringMinPeople: 15,
    openHours: JSON.stringify({ open: "11:00", close: "21:00" }),
    dietaryOptions: JSON.stringify([]),
    allergenInfo: JSON.stringify({ nuts: false, dairy: false, gluten: true, verified: true }),
    menuHighlights: JSON.stringify(["Brisket Plate", "Baby Back Ribs", "Pulled Pork Sandwich", "Mac & Cheese", "Corn Bread"]),
    rating: 4.6,
    imageEmoji: "🥩",
    address: "369 Smoke Ring Rd",
    phone: "555-0109",
  },
  {
    id: "rest-10",
    name: "Panera Bread",
    cuisine: "Sandwiches / Bakery",
    cuisineTags: JSON.stringify(["sandwiches", "soups", "salads", "bakery", "cafe"]),
    distanceMiles: 0.6,
    avgCostPerPerson: 12.0,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: true,
    cateringMinPeople: 10,
    openHours: JSON.stringify({ open: "06:30", close: "21:00" }),
    dietaryOptions: JSON.stringify(["vegetarian", "vegan", "dairy-free"]),
    allergenInfo: JSON.stringify({ nuts: true, dairy: true, gluten: true, verified: true }),
    menuHighlights: JSON.stringify(["Turkey Avocado Sandwich", "Broccoli Cheddar Soup", "Greek Salad", "Bagel", "Flatbread Pizza"]),
    rating: 4.0,
    imageEmoji: "🥪",
    address: "741 Bread Basket Blvd",
    phone: "555-0110",
  },
  {
    id: "rest-11",
    name: "Thai Garden",
    cuisine: "Thai",
    cuisineTags: JSON.stringify(["thai", "asian", "noodles", "curry", "spicy"]),
    distanceMiles: 3.5,
    avgCostPerPerson: 13.5,
    deliveryAvailable: true,
    pickupAvailable: true,
    cateringAvailable: true,
    cateringMinPeople: 12,
    openHours: JSON.stringify({ open: "11:00", close: "22:00" }),
    dietaryOptions: JSON.stringify(["vegetarian", "vegan", "gluten-free"]),
    allergenInfo: JSON.stringify({ nuts: true, dairy: false, gluten: false, verified: true }),
    menuHighlights: JSON.stringify(["Pad Thai", "Green Curry", "Tom Kha Soup", "Mango Sticky Rice", "Spring Rolls"]),
    rating: 4.5,
    imageEmoji: "🍜",
    address: "852 Lemongrass Ave",
    phone: "555-0111",
  },
  {
    id: "rest-12",
    name: "Olive Garden",
    cuisine: "Italian",
    cuisineTags: JSON.stringify(["italian", "pasta", "pizza", "breadsticks", "soup"]),
    distanceMiles: 3.9,
    avgCostPerPerson: 16.5,
    deliveryAvailable: false,
    pickupAvailable: true,
    cateringAvailable: true,
    cateringMinPeople: 20,
    openHours: JSON.stringify({ open: "11:00", close: "22:00" }),
    dietaryOptions: JSON.stringify(["vegetarian"]),
    allergenInfo: JSON.stringify({ nuts: false, dairy: true, gluten: true, verified: true }),
    menuHighlights: JSON.stringify(["Fettuccine Alfredo", "Chicken Parmigiana", "Tour of Italy", "Unlimited Breadsticks", "Minestrone"]),
    rating: 4.0,
    imageEmoji: "🍝",
    address: "963 Pasta Plaza",
    phone: "555-0112",
  },
];

// Demo participants with diverse preferences
const demoParticipants = [
  {
    name: "Alex Chen",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Vegetarian" },
      { type: "FAVORITE", value: "Indian" },
      { type: "LIKE", value: "Mediterranean" },
      { type: "LIKE", value: "Thai" },
      { type: "DISLIKE", value: "BBQ" },
      { type: "NO_GO", value: "Meat" },
    ],
  },
  {
    name: "Maria Rodriguez",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Gluten-free" },
      { type: "FAVORITE", value: "Mexican" },
      { type: "LIKE", value: "Salads" },
      { type: "DISLIKE", value: "Pizza" },
      { type: "NO_GO", value: "Wheat bread" },
    ],
  },
  {
    name: "Jordan Williams",
    isFlexible: true,
    preferences: [
      { type: "FAVORITE", value: "Burgers" },
      { type: "LIKE", value: "BBQ" },
      { type: "LIKE", value: "Pizza" },
      { type: "DISLIKE", value: "Vegan food" },
    ],
  },
  {
    name: "Priya Sharma",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Vegetarian" },
      { type: "DIETARY_RESTRICTION", value: "Halal" },
      { type: "FAVORITE", value: "Indian" },
      { type: "LIKE", value: "Mediterranean" },
      { type: "DISLIKE", value: "BBQ" },
      { type: "NO_GO", value: "Beef" },
      { type: "NO_GO", value: "Pork" },
    ],
  },
  {
    name: "Tyler Johnson",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Dairy-free" },
      { type: "FAVORITE", value: "BBQ" },
      { type: "LIKE", value: "Burgers" },
      { type: "LIKE", value: "Mexican" },
      { type: "DISLIKE", value: "Sushi" },
    ],
  },
  {
    name: "Sophie Nakamura",
    isFlexible: false,
    preferences: [
      { type: "FAVORITE", value: "Japanese" },
      { type: "FAVORITE", value: "Thai" },
      { type: "LIKE", value: "Chinese" },
      { type: "DISLIKE", value: "BBQ" },
      { type: "DISLIKE", value: "Fast food" },
    ],
  },
  {
    name: "Marcus Thompson",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Nut allergy" },
      { type: "FAVORITE", value: "Mediterranean" },
      { type: "LIKE", value: "Salads" },
      { type: "LIKE", value: "Sandwiches" },
      { type: "DISLIKE", value: "Spicy food" },
    ],
  },
  {
    name: "Aisha Okonkwo",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Halal" },
      { type: "DIETARY_RESTRICTION", value: "Vegan" },
      { type: "FAVORITE", value: "Mediterranean" },
      { type: "LIKE", value: "Salads" },
      { type: "NO_GO", value: "Pork" },
      { type: "NO_GO", value: "Alcohol" },
    ],
  },
  {
    name: "Derek Hoffman",
    isFlexible: false,
    preferences: [
      { type: "FAVORITE", value: "Pizza" },
      { type: "FAVORITE", value: "Italian" },
      { type: "LIKE", value: "Sandwiches" },
      { type: "DISLIKE", value: "Indian" },
      { type: "DISLIKE", value: "Spicy food" },
    ],
  },
  {
    name: "Luna Park",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Vegan" },
      { type: "FAVORITE", value: "Salads" },
      { type: "LIKE", value: "Mediterranean" },
      { type: "LIKE", value: "Thai" },
      { type: "NO_GO", value: "Meat" },
      { type: "NO_GO", value: "Dairy" },
    ],
  },
  {
    name: "Carlos Mendes",
    isFlexible: true,
    preferences: [
      { type: "FAVORITE", value: "Mexican" },
      { type: "LIKE", value: "BBQ" },
      { type: "LIKE", value: "Burgers" },
      { type: "DISLIKE", value: "Sushi" },
    ],
  },
  {
    name: "Hannah Kim",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Gluten-free" },
      { type: "DIETARY_RESTRICTION", value: "Dairy-free" },
      { type: "FAVORITE", value: "Salads" },
      { type: "LIKE", value: "Japanese" },
      { type: "LIKE", value: "Thai" },
      { type: "DISLIKE", value: "Pizza" },
    ],
  },
  {
    name: "Sam Rivera",
    isFlexible: true,
    preferences: [
      { type: "LIKE", value: "Mexican" },
      { type: "LIKE", value: "Mediterranean" },
      { type: "LIKE", value: "Salads" },
    ],
  },
  {
    name: "Olivia Brown",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Kosher" },
      { type: "FAVORITE", value: "Sandwiches" },
      { type: "LIKE", value: "Salads" },
      { type: "DISLIKE", value: "BBQ" },
      { type: "NO_GO", value: "Pork" },
      { type: "NO_GO", value: "Shellfish" },
    ],
  },
  {
    name: "Raj Patel",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Vegetarian" },
      { type: "FAVORITE", value: "Indian" },
      { type: "LIKE", value: "Mediterranean" },
      { type: "DISLIKE", value: "Burgers" },
      { type: "NO_GO", value: "Beef" },
    ],
  },
  {
    name: "Emma Davis",
    isFlexible: false,
    preferences: [
      { type: "FAVORITE", value: "Italian" },
      { type: "FAVORITE", value: "Pizza" },
      { type: "LIKE", value: "Sandwiches" },
      { type: "DISLIKE", value: "Spicy food" },
      { type: "DISLIKE", value: "BBQ" },
    ],
  },
  {
    name: "Kai Anderson",
    isFlexible: true,
    preferences: [
      { type: "LIKE", value: "Asian" },
      { type: "LIKE", value: "Sushi" },
      { type: "LIKE", value: "BBQ" },
      { type: "DISLIKE", value: "Salads" },
    ],
  },
  {
    name: "Fatima Hassan",
    isFlexible: false,
    preferences: [
      { type: "DIETARY_RESTRICTION", value: "Halal" },
      { type: "DIETARY_RESTRICTION", value: "Vegetarian" },
      { type: "FAVORITE", value: "Mediterranean" },
      { type: "LIKE", value: "Indian" },
      { type: "NO_GO", value: "Pork" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert restaurants
  for (const restaurant of restaurants) {
    await prisma.restaurant.upsert({
      where: { id: restaurant.id },
      update: restaurant,
      create: restaurant,
    });
  }
  console.log(`✅ ${restaurants.length} restaurants seeded`);

  // Create demo event
  const existingDemo = await prisma.lunchEvent.findFirst({
    where: { code: "DEMO2024" },
  });

  if (!existingDemo) {
    const demoEvent = await prisma.lunchEvent.create({
      data: {
        name: "Company Team Lunch 🎉",
        eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        headcount: 20,
        locationName: "Downtown Office",
        zipCode: "94105",
        radiusMiles: 5,
        budgetTotal: 300,
        budgetPerPerson: undefined,
        allowDelivery: true,
        allowPickup: true,
        allowCatering: true,
        notes: "Team lunch to celebrate Q4 goals! 🎊 Everyone is welcome.",
        code: "DEMO2024",
      },
    });

    for (const p of demoParticipants) {
      await prisma.participant.create({
        data: {
          eventId: demoEvent.id,
          name: p.name,
          isFlexible: p.isFlexible,
          preferences: {
            create: p.preferences.map((pref) => ({
              type: pref.type as any,
              value: pref.value,
            })),
          },
        },
      });
    }

    console.log(`✅ Demo event created: ${demoEvent.code} (id: ${demoEvent.id})`);
    console.log(`✅ ${demoParticipants.length} demo participants created`);
  } else {
    console.log("⏭️  Demo event already exists, skipping");
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
