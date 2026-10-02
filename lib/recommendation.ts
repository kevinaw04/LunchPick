/**
 * Restaurant Recommendation & Scoring Algorithm
 *
 * Priority levels:
 * 1. DIETARY_RESTRICTION — HARD constraint (disqualifying if not met)
 * 2. NO_GO              — Very strong negative (-10 per participant)
 * 3. DISLIKE            — Negative (-3 per participant)
 * 4. NEUTRAL/FLEXIBLE   — No effect
 * 5. LIKE               — Positive (+3 per participant)
 * 6. FAVORITE           — Strong positive (+6 per participant)
 */

export interface RestaurantData {
  id: string;
  name: string;
  cuisine: string;
  cuisineTags: string;      // JSON array
  distanceMiles: number;
  avgCostPerPerson: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  cateringAvailable: boolean;
  cateringMinPeople: number;
  openHours: string;        // JSON { open, close }
  dietaryOptions: string;   // JSON array
  allergenInfo: string;     // JSON { nuts, dairy, gluten, verified }
  menuHighlights: string;   // JSON array
  rating: number;
}

export interface ParticipantPreferenceData {
  type: "DIETARY_RESTRICTION" | "NO_GO" | "DISLIKE" | "LIKE" | "FAVORITE";
  value: string;
}

export interface ParticipantData {
  id: string;
  name: string;
  isFlexible: boolean;
  preferences: ParticipantPreferenceData[];
}

export interface EventData {
  headcount: number;
  budgetTotal?: number | null;
  budgetPerPerson?: number | null;
  allowDelivery: boolean;
  allowPickup: boolean;
  allowCatering: boolean;
  radiusMiles: number;
  eventDate: Date | string;
}

export interface RecommendationResult {
  restaurantId: string;
  totalScore: number;
  dietaryScore: number;
  preferenceScore: number;
  budgetScore: number;
  logisticsScore: number;
  compatibleCount: number;
  totalParticipants: number;
  satisfactionPct: number;
  explanation: RecommendationExplanation;
  isOverBudget: boolean;
  estimatedGroupCost: number;
}

export interface RecommendationExplanation {
  summary: string;
  positives: string[];
  negatives: string[];
  warnings: string[];
  allergenNote: string;
}

// Scoring weights
const WEIGHTS = {
  dietary: 40,
  preference: 30,
  budget: 15,
  logistics: 10,
  rating: 5,
};

const PREFERENCE_SCORES = {
  FAVORITE: 6,
  LIKE: 3,
  DISLIKE: -3,
  NO_GO: -10,
};

/**
 * Check whether a restaurant can accommodate a dietary restriction.
 * Returns: "yes" | "no" | "unknown"
 */
function checkDietaryCompatibility(
  dietaryOptions: string[],
  allergenInfo: Record<string, boolean | string>,
  restriction: string
): "yes" | "no" | "unknown" {
  const r = restriction.toLowerCase();
  const opts = dietaryOptions.map((o) => o.toLowerCase());

  // Direct match in dietary options
  if (opts.includes(r)) return "yes";
  if (r.includes("vegetarian") && opts.some((o) => o.includes("vegetarian"))) return "yes";
  if (r.includes("vegan") && opts.some((o) => o.includes("vegan"))) return "yes";
  if (r.includes("gluten") && opts.some((o) => o.includes("gluten"))) return "yes";
  if (r.includes("dairy") && opts.some((o) => o.includes("dairy"))) return "yes";
  if (r.includes("nut") && opts.some((o) => o.includes("nut"))) return "yes";
  if (r.includes("halal") && opts.some((o) => o.includes("halal"))) return "yes";
  if (r.includes("kosher") && opts.some((o) => o.includes("kosher"))) return "yes";

  // Check allergen info for allergies
  if (r.includes("nut") && allergenInfo.verified === true) {
    return allergenInfo.nuts === false ? "yes" : "no";
  }
  if (r.includes("dairy") && allergenInfo.verified === true) {
    return allergenInfo.dairy === false ? "yes" : "no";
  }
  if (r.includes("gluten") && allergenInfo.verified === true) {
    return allergenInfo.gluten === false ? "yes" : "no";
  }

  if (!allergenInfo.verified) return "unknown";
  return "no";
}

/**
 * Check whether a preference value matches a restaurant's cuisine/menu.
 */
function matchesRestaurant(
  value: string,
  cuisineTags: string[],
  cuisine: string,
  menuHighlights: string[]
): boolean {
  const v = value.toLowerCase();
  const allText = [
    ...cuisineTags,
    cuisine.toLowerCase(),
    ...menuHighlights.map((m) => m.toLowerCase()),
  ];

  return allText.some(
    (text) =>
      text.includes(v) ||
      v.includes(text.split(" ")[0]) // partial tag match
  );
}

/**
 * Check whether a no-go food item is a hard conflict with a restaurant.
 */
function hasNoGoConflict(
  noGoValue: string,
  cuisineTags: string[],
  cuisine: string,
  dietaryOptions: string[]
): boolean {
  const v = noGoValue.toLowerCase();
  const allText = [...cuisineTags, cuisine.toLowerCase(), ...dietaryOptions.map((d) => d.toLowerCase())];

  // Special: if someone lists "meat" as no-go and the restaurant has no vegetarian option
  if ((v === "meat" || v === "beef" || v === "pork" || v === "chicken") && !dietaryOptions.map((d) => d.toLowerCase()).includes("vegetarian")) {
    return true;
  }
  if (v === "dairy" && !dietaryOptions.map((d) => d.toLowerCase()).some((d) => d.includes("dairy"))) {
    // Dairy-free options available
    return false;
  }

  return allText.some((text) => text.includes(v) || v.includes(text.split(" ")[0]));
}

/**
 * Main scoring function — scores a single restaurant against all participants.
 */
export function scoreRestaurant(
  restaurant: RestaurantData,
  participants: ParticipantData[],
  event: EventData
): RecommendationResult {
  const cuisineTags: string[] = JSON.parse(restaurant.cuisineTags || "[]");
  const dietaryOptions: string[] = JSON.parse(restaurant.dietaryOptions || "[]");
  const allergenInfo: Record<string, boolean | string> = JSON.parse(restaurant.allergenInfo || "{}");
  const menuHighlights: string[] = JSON.parse(restaurant.menuHighlights || "[]");

  const totalParticipants = participants.length;
  if (totalParticipants === 0) {
    return {
      restaurantId: restaurant.id,
      totalScore: 0,
      dietaryScore: 0,
      preferenceScore: 0,
      budgetScore: 0,
      logisticsScore: 0,
      compatibleCount: 0,
      totalParticipants: 0,
      satisfactionPct: 0,
      explanation: {
        summary: "No participants yet.",
        positives: [],
        negatives: [],
        warnings: [],
        allergenNote: "",
      },
      isOverBudget: false,
      estimatedGroupCost: 0,
    };
  }

  // ─────────────────────────────────────────
  // 1. Dietary Compatibility Score
  // ─────────────────────────────────────────
  let dietaryHardFails = 0;
  let allergenUnknownCount = 0;
  const allergenWarnings: string[] = [];
  const hardFailDetails: string[] = [];
  let compatibleCount = 0;

  for (const participant of participants) {
    let participantCompatible = true;

    const restrictions = participant.preferences.filter(
      (p) => p.type === "DIETARY_RESTRICTION"
    );

    for (const restriction of restrictions) {
      const compat = checkDietaryCompatibility(
        dietaryOptions,
        allergenInfo,
        restriction.value
      );
      if (compat === "no") {
        dietaryHardFails++;
        participantCompatible = false;
        hardFailDetails.push(`${participant.name}: ${restriction.value}`);
      } else if (compat === "unknown") {
        allergenUnknownCount++;
        allergenWarnings.push(`${restriction.value} (${participant.name})`);
      }
    }

    if (participantCompatible) compatibleCount++;
  }

  // Dietary score: start at 100, subtract for each hard fail
  // A single hard fail means dietary score is significantly penalized
  const dietaryRaw = totalParticipants === 0
    ? 100
    : Math.max(0, ((totalParticipants - dietaryHardFails) / totalParticipants) * 100);
  const dietaryScore = dietaryRaw;

  // ─────────────────────────────────────────
  // 2. Preference Score
  // ─────────────────────────────────────────
  let prefRaw = 0;
  let favoriteMatches = 0;
  let likeMatches = 0;
  let dislikeMatches = 0;
  let noGoConflicts = 0;

  for (const participant of participants) {
    // Skip preference scoring if this restaurant fails dietary needs
    const failedDietary = participant.preferences
      .filter((p) => p.type === "DIETARY_RESTRICTION")
      .some((p) => {
        const compat = checkDietaryCompatibility(dietaryOptions, allergenInfo, p.value);
        return compat === "no";
      });

    if (failedDietary) continue; // Already penalized in dietary score

    for (const pref of participant.preferences) {
      if (pref.type === "DIETARY_RESTRICTION") continue;

      const matches = matchesRestaurant(pref.value, cuisineTags, restaurant.cuisine, menuHighlights);

      if (pref.type === "FAVORITE" && matches) {
        prefRaw += PREFERENCE_SCORES.FAVORITE;
        favoriteMatches++;
      } else if (pref.type === "LIKE" && matches) {
        prefRaw += PREFERENCE_SCORES.LIKE;
        likeMatches++;
      } else if (pref.type === "DISLIKE" && matches) {
        prefRaw += PREFERENCE_SCORES.DISLIKE;
        dislikeMatches++;
      } else if (pref.type === "NO_GO") {
        const conflict = hasNoGoConflict(pref.value, cuisineTags, restaurant.cuisine, dietaryOptions);
        if (conflict) {
          prefRaw += PREFERENCE_SCORES.NO_GO;
          noGoConflicts++;
        }
      }
    }

    // Flexible participants get a small bonus
    if (participant.isFlexible) prefRaw += 1;
  }

  // Normalize preference score to 0-100
  const maxPossiblePref = totalParticipants * PREFERENCE_SCORES.FAVORITE;
  const minPossiblePref = totalParticipants * PREFERENCE_SCORES.NO_GO;
  const prefRange = maxPossiblePref - minPossiblePref;
  const prefNormalized = prefRange > 0
    ? ((prefRaw - minPossiblePref) / prefRange) * 100
    : 50;
  const preferenceScore = Math.max(0, Math.min(100, prefNormalized));

  // ─────────────────────────────────────────
  // 3. Budget Score
  // ─────────────────────────────────────────
  const headcount = Math.max(event.headcount, totalParticipants);
  const estimatedGroupCost = restaurant.avgCostPerPerson * headcount;

  let effectiveBudget: number | null = null;
  if (event.budgetTotal) {
    effectiveBudget = event.budgetTotal;
  } else if (event.budgetPerPerson) {
    effectiveBudget = event.budgetPerPerson * headcount;
  }

  let budgetScore = 80; // default if no budget specified
  let isOverBudget = false;

  if (effectiveBudget && effectiveBudget > 0) {
    const ratio = estimatedGroupCost / effectiveBudget;
    if (ratio <= 0.7) budgetScore = 100;        // well under budget
    else if (ratio <= 0.85) budgetScore = 90;   // comfortably under
    else if (ratio <= 1.0) budgetScore = 75;    // just under budget
    else if (ratio <= 1.1) budgetScore = 40;    // slightly over
    else if (ratio <= 1.25) budgetScore = 20;   // over budget
    else budgetScore = 0;                        // way over budget

    if (ratio > 1.0) isOverBudget = true;
  }

  // ─────────────────────────────────────────
  // 4. Logistics Score
  // ─────────────────────────────────────────
  let logisticsScore = 50; // baseline

  // Fulfillment method
  const supportsRequestedMethod =
    (event.allowDelivery && restaurant.deliveryAvailable) ||
    (event.allowPickup && restaurant.pickupAvailable) ||
    (event.allowCatering && restaurant.cateringAvailable);

  if (!supportsRequestedMethod) {
    logisticsScore = 10; // major penalty
  } else {
    logisticsScore = 70;
    if (event.allowCatering && restaurant.cateringAvailable) logisticsScore += 15;
    if (restaurant.cateringAvailable && headcount >= restaurant.cateringMinPeople) logisticsScore += 15;
  }

  // Distance penalty
  if (restaurant.distanceMiles <= 1) logisticsScore = Math.min(100, logisticsScore + 10);
  else if (restaurant.distanceMiles <= 2) logisticsScore = Math.min(100, logisticsScore + 5);
  else if (restaurant.distanceMiles > event.radiusMiles) logisticsScore = Math.max(0, logisticsScore - 30);

  // Open during lunch
  const eventHour = new Date(event.eventDate).getHours();
  const hours = JSON.parse(restaurant.openHours || '{"open":"10:00","close":"22:00"}');
  const [openH] = hours.open.split(":").map(Number);
  const [closeH] = hours.close.split(":").map(Number);
  if (eventHour < openH || eventHour >= closeH) logisticsScore = 0;

  logisticsScore = Math.max(0, Math.min(100, logisticsScore));

  // ─────────────────────────────────────────
  // 5. Rating bonus
  // ─────────────────────────────────────────
  const ratingScore = ((restaurant.rating - 1) / 4) * 100; // normalize 1-5 to 0-100

  // ─────────────────────────────────────────
  // 6. Weighted Total
  // ─────────────────────────────────────────
  const totalScore =
    (dietaryScore * WEIGHTS.dietary +
      preferenceScore * WEIGHTS.preference +
      budgetScore * WEIGHTS.budget +
      logisticsScore * WEIGHTS.logistics +
      ratingScore * WEIGHTS.rating) /
    100;

  const satisfactionPct = totalParticipants > 0
    ? Math.round((compatibleCount / totalParticipants) * 100)
    : 0;

  // ─────────────────────────────────────────
  // 7. Build Explanation
  // ─────────────────────────────────────────
  const positives: string[] = [];
  const negatives: string[] = [];
  const warnings: string[] = [];

  if (favoriteMatches > 0) positives.push(`${favoriteMatches} participant${favoriteMatches > 1 ? "s" : ""} list it as a favorite cuisine`);
  if (likeMatches > 0) positives.push(`${likeMatches} participant${likeMatches > 1 ? "s" : ""} like this cuisine`);
  if (dietaryHardFails === 0 && totalParticipants > 0) positives.push("All reported dietary restrictions can be accommodated");
  if (!isOverBudget && effectiveBudget) positives.push(`Stays within the $${effectiveBudget.toFixed(0)} budget`);
  if (restaurant.cateringAvailable) positives.push("Catering available for groups");
  if (restaurant.deliveryAvailable) positives.push("Delivery available");
  if (restaurant.distanceMiles <= 2) positives.push(`Close by (${restaurant.distanceMiles} miles away)`);

  if (dietaryHardFails > 0) {
    negatives.push(`${dietaryHardFails} participant${dietaryHardFails > 1 ? "s" : ""} have dietary restrictions that may not be met (${hardFailDetails.join(", ")})`);
  }
  if (noGoConflicts > 0) negatives.push(`${noGoConflicts} participant${noGoConflicts > 1 ? "s" : ""} have this as a no-go`);
  if (dislikeMatches > 0) negatives.push(`${dislikeMatches} participant${dislikeMatches > 1 ? "s" : ""} dislike this cuisine`);
  if (isOverBudget) negatives.push(`Over budget by $${(estimatedGroupCost - (effectiveBudget || 0)).toFixed(2)}`);
  if (!supportsRequestedMethod) negatives.push("Does not support the requested fulfillment method");

  if (allergenUnknownCount > 0) {
    warnings.push(`Allergen compatibility not verified for: ${allergenWarnings.join(", ")}`);
  }

  const allergenNote = allergenInfo.verified
    ? "Allergen information verified."
    : "Allergen compatibility not verified — contact restaurant before ordering.";

  let summary = "";
  if (totalScore >= 70) {
    summary = `${restaurant.name} ranked highly because it ${positives.slice(0, 3).join(", ")}.`;
  } else if (totalScore >= 45) {
    summary = `${restaurant.name} is a reasonable option but has some concerns: ${negatives.slice(0, 2).join("; ")}.`;
  } else {
    summary = `${restaurant.name} scored lower because ${negatives.slice(0, 2).join("; ")}.`;
  }

  return {
    restaurantId: restaurant.id,
    totalScore: Math.round(totalScore * 10) / 10,
    dietaryScore: Math.round(dietaryScore * 10) / 10,
    preferenceScore: Math.round(preferenceScore * 10) / 10,
    budgetScore: Math.round(budgetScore * 10) / 10,
    logisticsScore: Math.round(logisticsScore * 10) / 10,
    compatibleCount,
    totalParticipants,
    satisfactionPct,
    explanation: { summary, positives, negatives, warnings, allergenNote },
    isOverBudget,
    estimatedGroupCost: Math.round(estimatedGroupCost * 100) / 100,
  };
}

/**
 * Score all restaurants and return sorted results.
 */
export function rankRestaurants(
  restaurants: RestaurantData[],
  participants: ParticipantData[],
  event: EventData
): { restaurant: RestaurantData; result: RecommendationResult }[] {
  const scored = restaurants.map((r) => ({
    restaurant: r,
    result: scoreRestaurant(r, participants, event),
  }));

  return scored.sort((a, b) => {
    // Primary: total score
    if (b.result.totalScore !== a.result.totalScore) {
      return b.result.totalScore - a.result.totalScore;
    }
    // Secondary: satisfaction percentage
    if (b.result.satisfactionPct !== a.result.satisfactionPct) {
      return b.result.satisfactionPct - a.result.satisfactionPct;
    }
    // Tertiary: alphabetical
    return a.restaurant.name.localeCompare(b.restaurant.name);
  });
}
