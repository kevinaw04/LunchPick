/**
 * In-memory store — no database needed for this prototype.
 * All data lives in module-level Maps and resets on server restart.
 */

import { randomUUID } from "crypto";

export type PreferenceType = "DIETARY_RESTRICTION" | "NO_GO" | "DISLIKE" | "LIKE" | "FAVORITE";

export interface Preference { id: string; participantId: string; type: PreferenceType; value: string; }
export interface Participant { id: string; eventId: string; name: string; isFlexible: boolean; preferences: Preference[]; createdAt: string; updatedAt: string; }
export interface LunchEvent {
  id: string; name: string; eventDate: string; headcount: number;
  locationName: string; zipCode: string; radiusMiles: number;
  budgetTotal: number | null; budgetPerPerson: number | null;
  allowDelivery: boolean; allowPickup: boolean; allowCatering: boolean;
  notes: string | null; code: string; createdAt: string; updatedAt: string;
}
export interface Restaurant {
  id: string; name: string; cuisine: string; cuisineTags: string;
  distanceMiles: number; avgCostPerPerson: number;
  deliveryAvailable: boolean; pickupAvailable: boolean; cateringAvailable: boolean;
  cateringMinPeople: number; openHours: string; dietaryOptions: string;
  allergenInfo: string; menuHighlights: string; rating: number;
  imageEmoji: string; address: string; phone: string;
}
export interface RestaurantScore {
  id: string; eventId: string; restaurantId: string;
  totalScore: number; dietaryScore: number; preferenceScore: number;
  budgetScore: number; logisticsScore: number;
  compatibleCount: number; totalParticipants: number; satisfactionPct: number;
  explanation: string; createdAt: string;
}
export interface SelectedRestaurant { id: string; eventId: string; restaurantId: string; selectedAt: string; notes: string | null; }
export interface LeftoverDonation { id: string; eventId: string; hasLeftovers: boolean; servingsCount: number | null; notes: string | null; createdAt: string; updatedAt: string; }

// ── Global state ──────────────────────────────────────────────────────────────
export const events   = new Map<string, LunchEvent>();
export const participants = new Map<string, Participant>();        // key = participant.id
export const scores   = new Map<string, RestaurantScore>();        // key = score.id
export const selected = new Map<string, SelectedRestaurant>();     // key = eventId
export const leftovers = new Map<string, LeftoverDonation>();      // key = eventId

function jstr(v: unknown) { return JSON.stringify(v); }
function now() { return new Date().toISOString(); }
export function uid() { return randomUUID(); }

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getEventParticipants(eventId: string): Participant[] {
  return [...participants.values()].filter(p => p.eventId === eventId);
}
export function getEventScores(eventId: string): RestaurantScore[] {
  return [...scores.values()].filter(s => s.eventId === eventId).sort((a,b) => b.totalScore - a.totalScore);
}
export function makeEvent(data: Omit<LunchEvent, "id"|"createdAt"|"updatedAt">): LunchEvent {
  const e: LunchEvent = { ...data, id: uid(), createdAt: now(), updatedAt: now() };
  events.set(e.id, e);
  return e;
}
export function makeParticipant(data: Omit<Participant, "id"|"createdAt"|"updatedAt"|"preferences"> & { preferences: Omit<Preference,"id"|"participantId">[] }): Participant {
  const id = uid();
  const prefs: Preference[] = data.preferences.map(p => ({ ...p, id: uid(), participantId: id }));
  const p: Participant = { ...data, id, preferences: prefs, createdAt: now(), updatedAt: now() };
  participants.set(id, p);
  return p;
}
export function upsertParticipant(eventId: string, name: string, isFlexible: boolean, rawPrefs: Omit<Preference,"id"|"participantId">[]): Participant {
  // find existing by name (case-insensitive)
  const existing = [...participants.values()].find(p => p.eventId === eventId && p.name.toLowerCase() === name.toLowerCase());
  const id = existing?.id ?? uid();
  const prefs: Preference[] = rawPrefs.map(p => ({ ...p, id: uid(), participantId: id }));
  const p: Participant = { id, eventId, name, isFlexible, preferences: prefs, createdAt: existing?.createdAt ?? now(), updatedAt: now() };
  participants.set(id, p);
  return p;
}

// ── Restaurant seed data ──────────────────────────────────────────────────────
export const restaurants = new Map<string, Restaurant>();

const RESTAURANT_SEED: Restaurant[] = [
  { id:"rest-01", name:"Mediterranean Grill", cuisine:"Mediterranean", cuisineTags:jstr(["mediterranean","greek","healthy","salads","wraps"]), distanceMiles:2.3, avgCostPerPerson:12.4, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:true, cateringMinPeople:10, openHours:jstr({open:"10:30",close:"21:00"}), dietaryOptions:jstr(["vegetarian","vegan","gluten-free","dairy-free","halal"]), allergenInfo:jstr({nuts:false,dairy:true,gluten:true,verified:true}), menuHighlights:jstr(["Hummus Plate","Chicken Shawarma","Falafel Bowl","Greek Salad","Lamb Gyro"]), rating:4.7, imageEmoji:"🫒", address:"123 Olive Ave", phone:"555-0101" },
  { id:"rest-02", name:"Chipotle Mexican Grill", cuisine:"Mexican", cuisineTags:jstr(["mexican","burritos","tacos","bowls","fast-casual"]), distanceMiles:1.1, avgCostPerPerson:11.0, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:true, cateringMinPeople:20, openHours:jstr({open:"10:45",close:"22:00"}), dietaryOptions:jstr(["vegetarian","vegan","gluten-free","dairy-free"]), allergenInfo:jstr({nuts:false,dairy:true,gluten:true,verified:true}), menuHighlights:jstr(["Burrito Bowl","Sofritas Bowl","Carnitas Tacos","Chips & Guac","Veggie Burrito"]), rating:4.3, imageEmoji:"🌯", address:"456 Burrito Blvd", phone:"555-0102" },
  { id:"rest-03", name:"Pizza Palace", cuisine:"Pizza", cuisineTags:jstr(["pizza","italian","pasta","cheesy"]), distanceMiles:0.8, avgCostPerPerson:10.5, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:false, cateringMinPeople:0, openHours:jstr({open:"11:00",close:"23:00"}), dietaryOptions:jstr(["vegetarian"]), allergenInfo:jstr({nuts:false,dairy:true,gluten:true,verified:true}), menuHighlights:jstr(["Pepperoni Pizza","Margherita","BBQ Chicken Pizza","Garlic Bread","Caesar Salad"]), rating:4.1, imageEmoji:"🍕", address:"789 Dough St", phone:"555-0103" },
  { id:"rest-04", name:"Shake Shack", cuisine:"Burgers", cuisineTags:jstr(["burgers","american","shakes","fries","fast-casual"]), distanceMiles:1.7, avgCostPerPerson:14.0, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:false, cateringMinPeople:0, openHours:jstr({open:"10:30",close:"22:00"}), dietaryOptions:jstr(["vegetarian"]), allergenInfo:jstr({nuts:true,dairy:true,gluten:true,verified:true}), menuHighlights:jstr(["ShackBurger","SmokeShack","Veggie Shack","Crinkle Fries","Shakes"]), rating:4.5, imageEmoji:"🍔", address:"321 Burger Lane", phone:"555-0104" },
  { id:"rest-05", name:"Sweetgreen", cuisine:"Healthy / Salads", cuisineTags:jstr(["salads","healthy","bowls","grain bowls","vegan-friendly"]), distanceMiles:1.4, avgCostPerPerson:13.5, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:true, cateringMinPeople:10, openHours:jstr({open:"10:30",close:"21:00"}), dietaryOptions:jstr(["vegetarian","vegan","gluten-free","dairy-free","nut-free"]), allergenInfo:jstr({nuts:false,dairy:false,gluten:false,verified:true}), menuHighlights:jstr(["Harvest Bowl","Kale Caesar","Spicy Thai Salad","Portobello Bowl","Roasted Veggie"]), rating:4.4, imageEmoji:"🥗", address:"654 Garden Way", phone:"555-0105" },
  { id:"rest-06", name:"Panda Express", cuisine:"Chinese / Asian", cuisineTags:jstr(["chinese","asian","noodles","rice","fast-casual"]), distanceMiles:2.0, avgCostPerPerson:9.5, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:true, cateringMinPeople:15, openHours:jstr({open:"10:30",close:"21:30"}), dietaryOptions:jstr(["vegetarian"]), allergenInfo:jstr({nuts:true,dairy:false,gluten:true,verified:true}), menuHighlights:jstr(["Orange Chicken","Kung Pao Chicken","Chow Mein","Fried Rice","Mushroom Chicken"]), rating:3.9, imageEmoji:"🥡", address:"987 Dragon Rd", phone:"555-0106" },
  { id:"rest-07", name:"Curry House Indian", cuisine:"Indian", cuisineTags:jstr(["indian","curry","naan","rice","spicy","vegetarian-friendly"]), distanceMiles:3.2, avgCostPerPerson:13.0, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:true, cateringMinPeople:10, openHours:jstr({open:"11:00",close:"22:00"}), dietaryOptions:jstr(["vegetarian","vegan","gluten-free","halal"]), allergenInfo:jstr({nuts:true,dairy:true,gluten:false,verified:true}), menuHighlights:jstr(["Chicken Tikka Masala","Saag Paneer","Dal Makhani","Biryani","Garlic Naan"]), rating:4.6, imageEmoji:"🍛", address:"147 Spice Market", phone:"555-0107" },
  { id:"rest-08", name:"Sushi Sakura", cuisine:"Japanese", cuisineTags:jstr(["japanese","sushi","ramen","asian","fish"]), distanceMiles:4.1, avgCostPerPerson:18.0, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:false, cateringMinPeople:0, openHours:jstr({open:"11:30",close:"21:00"}), dietaryOptions:jstr(["vegetarian","gluten-free"]), allergenInfo:jstr({nuts:false,dairy:false,gluten:true,verified:true}), menuHighlights:jstr(["California Roll","Spicy Tuna Roll","Salmon Sashimi","Miso Ramen","Veggie Roll"]), rating:4.8, imageEmoji:"🍱", address:"258 Cherry Blossom St", phone:"555-0108" },
  { id:"rest-09", name:"Brisket Brothers BBQ", cuisine:"BBQ", cuisineTags:jstr(["bbq","american","smoky","meat","ribs","brisket"]), distanceMiles:2.8, avgCostPerPerson:16.0, deliveryAvailable:false, pickupAvailable:true, cateringAvailable:true, cateringMinPeople:15, openHours:jstr({open:"11:00",close:"21:00"}), dietaryOptions:jstr([]), allergenInfo:jstr({nuts:false,dairy:false,gluten:true,verified:true}), menuHighlights:jstr(["Brisket Plate","Baby Back Ribs","Pulled Pork Sandwich","Mac & Cheese","Corn Bread"]), rating:4.6, imageEmoji:"🥩", address:"369 Smoke Ring Rd", phone:"555-0109" },
  { id:"rest-10", name:"Panera Bread", cuisine:"Sandwiches / Bakery", cuisineTags:jstr(["sandwiches","soups","salads","bakery","cafe"]), distanceMiles:0.6, avgCostPerPerson:12.0, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:true, cateringMinPeople:10, openHours:jstr({open:"06:30",close:"21:00"}), dietaryOptions:jstr(["vegetarian","vegan","dairy-free"]), allergenInfo:jstr({nuts:true,dairy:true,gluten:true,verified:true}), menuHighlights:jstr(["Turkey Avocado Sandwich","Broccoli Cheddar Soup","Greek Salad","Bagel","Flatbread Pizza"]), rating:4.0, imageEmoji:"🥪", address:"741 Bread Basket Blvd", phone:"555-0110" },
  { id:"rest-11", name:"Thai Garden", cuisine:"Thai", cuisineTags:jstr(["thai","asian","noodles","curry","spicy"]), distanceMiles:3.5, avgCostPerPerson:13.5, deliveryAvailable:true, pickupAvailable:true, cateringAvailable:true, cateringMinPeople:12, openHours:jstr({open:"11:00",close:"22:00"}), dietaryOptions:jstr(["vegetarian","vegan","gluten-free"]), allergenInfo:jstr({nuts:true,dairy:false,gluten:false,verified:true}), menuHighlights:jstr(["Pad Thai","Green Curry","Tom Kha Soup","Mango Sticky Rice","Spring Rolls"]), rating:4.5, imageEmoji:"🍜", address:"852 Lemongrass Ave", phone:"555-0111" },
  { id:"rest-12", name:"Olive Garden", cuisine:"Italian", cuisineTags:jstr(["italian","pasta","pizza","breadsticks","soup"]), distanceMiles:3.9, avgCostPerPerson:16.5, deliveryAvailable:false, pickupAvailable:true, cateringAvailable:true, cateringMinPeople:20, openHours:jstr({open:"11:00",close:"22:00"}), dietaryOptions:jstr(["vegetarian"]), allergenInfo:jstr({nuts:false,dairy:true,gluten:true,verified:true}), menuHighlights:jstr(["Fettuccine Alfredo","Chicken Parmigiana","Tour of Italy","Unlimited Breadsticks","Minestrone"]), rating:4.0, imageEmoji:"🍝", address:"963 Pasta Plaza", phone:"555-0112" },
];
RESTAURANT_SEED.forEach(r => restaurants.set(r.id, r));

// ── Demo event (seeded once at module load) ───────────────────────────────────
const DEMO_CODE = "DEMO24";

function seedDemo() {
  const demoEvent = makeEvent({
    name: "Company Team Lunch 🎉", eventDate: new Date(Date.now() + 2*86400*1000).toISOString(),
    headcount: 20, locationName: "Downtown Office", zipCode: "94105",
    radiusMiles: 5, budgetTotal: 300, budgetPerPerson: null,
    allowDelivery: true, allowPickup: true, allowCatering: true,
    notes: "Team lunch to celebrate Q4 goals! Everyone is welcome. 🎊", code: DEMO_CODE,
  });
  const e = demoEvent;

  const DEMO_PARTICIPANTS: Array<{ name:string; isFlexible:boolean; preferences:Omit<Preference,"id"|"participantId">[] }> = [
    { name:"Alex Chen", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Vegetarian"},{type:"FAVORITE",value:"Indian"},{type:"LIKE",value:"Mediterranean"},{type:"LIKE",value:"Thai"},{type:"DISLIKE",value:"BBQ"},{type:"NO_GO",value:"Meat"}] },
    { name:"Maria Rodriguez", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Gluten-free"},{type:"FAVORITE",value:"Mexican"},{type:"LIKE",value:"Salads"},{type:"DISLIKE",value:"Pizza"},{type:"NO_GO",value:"Wheat bread"}] },
    { name:"Jordan Williams", isFlexible:true, preferences:[{type:"FAVORITE",value:"Burgers"},{type:"LIKE",value:"BBQ"},{type:"LIKE",value:"Pizza"},{type:"DISLIKE",value:"Vegan food"}] },
    { name:"Priya Sharma", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Vegetarian"},{type:"DIETARY_RESTRICTION",value:"Halal"},{type:"FAVORITE",value:"Indian"},{type:"LIKE",value:"Mediterranean"},{type:"DISLIKE",value:"BBQ"},{type:"NO_GO",value:"Beef"},{type:"NO_GO",value:"Pork"}] },
    { name:"Tyler Johnson", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Dairy-free"},{type:"FAVORITE",value:"BBQ"},{type:"LIKE",value:"Burgers"},{type:"LIKE",value:"Mexican"},{type:"DISLIKE",value:"Sushi"}] },
    { name:"Sophie Nakamura", isFlexible:false, preferences:[{type:"FAVORITE",value:"Japanese"},{type:"FAVORITE",value:"Thai"},{type:"LIKE",value:"Chinese"},{type:"DISLIKE",value:"BBQ"},{type:"DISLIKE",value:"Fast food"}] },
    { name:"Marcus Thompson", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Nut allergy"},{type:"FAVORITE",value:"Mediterranean"},{type:"LIKE",value:"Salads"},{type:"LIKE",value:"Sandwiches"},{type:"DISLIKE",value:"Spicy food"}] },
    { name:"Aisha Okonkwo", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Halal"},{type:"DIETARY_RESTRICTION",value:"Vegan"},{type:"FAVORITE",value:"Mediterranean"},{type:"LIKE",value:"Salads"},{type:"NO_GO",value:"Pork"},{type:"NO_GO",value:"Alcohol"}] },
    { name:"Derek Hoffman", isFlexible:false, preferences:[{type:"FAVORITE",value:"Pizza"},{type:"FAVORITE",value:"Italian"},{type:"LIKE",value:"Sandwiches"},{type:"DISLIKE",value:"Indian"},{type:"DISLIKE",value:"Spicy food"}] },
    { name:"Luna Park", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Vegan"},{type:"FAVORITE",value:"Salads"},{type:"LIKE",value:"Mediterranean"},{type:"LIKE",value:"Thai"},{type:"NO_GO",value:"Meat"},{type:"NO_GO",value:"Dairy"}] },
    { name:"Carlos Mendes", isFlexible:true, preferences:[{type:"FAVORITE",value:"Mexican"},{type:"LIKE",value:"BBQ"},{type:"LIKE",value:"Burgers"},{type:"DISLIKE",value:"Sushi"}] },
    { name:"Hannah Kim", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Gluten-free"},{type:"DIETARY_RESTRICTION",value:"Dairy-free"},{type:"FAVORITE",value:"Salads"},{type:"LIKE",value:"Japanese"},{type:"LIKE",value:"Thai"},{type:"DISLIKE",value:"Pizza"}] },
    { name:"Sam Rivera", isFlexible:true, preferences:[{type:"LIKE",value:"Mexican"},{type:"LIKE",value:"Mediterranean"},{type:"LIKE",value:"Salads"}] },
    { name:"Olivia Brown", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Kosher"},{type:"FAVORITE",value:"Sandwiches"},{type:"LIKE",value:"Salads"},{type:"DISLIKE",value:"BBQ"},{type:"NO_GO",value:"Pork"},{type:"NO_GO",value:"Shellfish"}] },
    { name:"Raj Patel", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Vegetarian"},{type:"FAVORITE",value:"Indian"},{type:"LIKE",value:"Mediterranean"},{type:"DISLIKE",value:"Burgers"},{type:"NO_GO",value:"Beef"}] },
    { name:"Emma Davis", isFlexible:false, preferences:[{type:"FAVORITE",value:"Italian"},{type:"FAVORITE",value:"Pizza"},{type:"LIKE",value:"Sandwiches"},{type:"DISLIKE",value:"Spicy food"},{type:"DISLIKE",value:"BBQ"}] },
    { name:"Kai Anderson", isFlexible:true, preferences:[{type:"LIKE",value:"Asian"},{type:"LIKE",value:"Sushi"},{type:"LIKE",value:"BBQ"},{type:"DISLIKE",value:"Salads"}] },
    { name:"Fatima Hassan", isFlexible:false, preferences:[{type:"DIETARY_RESTRICTION",value:"Halal"},{type:"DIETARY_RESTRICTION",value:"Vegetarian"},{type:"FAVORITE",value:"Mediterranean"},{type:"LIKE",value:"Indian"},{type:"NO_GO",value:"Pork"}] },
  ];

  DEMO_PARTICIPANTS.forEach(p => {
    makeParticipant({ eventId: e.id, name: p.name, isFlexible: p.isFlexible, preferences: p.preferences });
  });

  return e;
}

// seed once
let _demoEventId: string | null = null;
export function getDemoEventId(): string {
  if (_demoEventId && events.has(_demoEventId)) return _demoEventId;
  // find existing demo
  const existing = [...events.values()].find(e => e.code === DEMO_CODE);
  if (existing) { _demoEventId = existing.id; return existing.id; }
  const e = seedDemo();
  _demoEventId = e.id;
  return e.id;
}

// initialise on import
getDemoEventId();
