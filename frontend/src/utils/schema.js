/**
 * Validates that an object conforms to the expected Trip Itinerary schema.
 * Throws a detailed error listing all validation failures if it doesn't.
 */
export function validateTripSchema(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    throw new Error('Data is empty or not a valid JSON object');
  }

  // Root validation
  if (!data.tripTitle || typeof data.tripTitle !== 'string') {
    errors.push("Root: Missing or invalid 'tripTitle' (string required)");
  }
  if (!data.destination || typeof data.destination !== 'string') {
    errors.push("Root: Missing or invalid 'destination' (string required)");
  }
  if (data.durationDays === undefined || typeof data.durationDays !== 'number') {
    errors.push("Root: Missing or invalid 'durationDays' (number required)");
  }
  if (!data.tripSummary || typeof data.tripSummary !== 'string') {
    errors.push("Root: Missing or invalid 'tripSummary' (string required)");
  }
  if (!Array.isArray(data.packingSuggestions)) {
    errors.push("Root: Missing or invalid 'packingSuggestions' (array required)");
  }

  // Itinerary validation
  if (!Array.isArray(data.itinerary)) {
    errors.push("Root: Missing or invalid 'itinerary' (array required)");
  } else {
    data.itinerary.forEach((day, dayIndex) => {
      const dayLabel = `Itinerary Day[${dayIndex + 1}]`;
      
      if (day.dayNumber === undefined || typeof day.dayNumber !== 'number') {
        errors.push(`${dayLabel}: Missing or invalid 'dayNumber' (number required)`);
      }
      if (!day.dayTheme || typeof day.dayTheme !== 'string') {
        errors.push(`${dayLabel}: Missing or invalid 'dayTheme' (string required)`);
      }
      
      if (!Array.isArray(day.stops)) {
        errors.push(`${dayLabel}: Missing or invalid 'stops' (array required)`);
      } else {
        day.stops.forEach((stop, stopIndex) => {
          const stopLabel = `${dayLabel} Stop[${stopIndex + 1}]`;
          
          if (!stop.id) {
            errors.push(`${stopLabel}: Missing 'id'`);
          }
          if (!stop.time || typeof stop.time !== 'string') {
            errors.push(`${stopLabel}: Missing or invalid 'time'`);
          }
          if (!stop.activity || typeof stop.activity !== 'string') {
            errors.push(`${stopLabel}: Missing or invalid 'activity'`);
          }
          if (!stop.location || typeof stop.location !== 'string') {
            errors.push(`${stopLabel}: Missing or invalid 'location'`);
          }
          if (!stop.description || typeof stop.description !== 'string') {
            errors.push(`${stopLabel}: Missing or invalid 'description'`);
          }
          if (!stop.category || typeof stop.category !== 'string') {
            errors.push(`${stopLabel}: Missing or invalid 'category'`);
          }
        });
      }
    });
  }

  if (errors.length > 0) {
    const errorMsg = errors.join('\n');
    const err = new Error('Schema validation failed:');
    err.validationErrors = errors;
    throw err;
  }

  return true;
}

/**
 * Generates sample/fallback trip data to recover from severe errors or run in offline/demo mode.
 */
export function getDemoTripData(destination = "Kyoto, Japan") {
  return {
    tripTitle: `Wonders of ${destination}`,
    tripSummary: `A beautiful cultural journey through ${destination}, covering iconic landmarks, culinary hot spots, and hidden local treasures.`,
    destination: destination,
    durationDays: 3,
    budgetLevel: "Moderate",
    packingSuggestions: [
      "Comfortable walking shoes (essential)",
      "Weather-appropriate layering options",
      "Refillable water bottle",
      "Power bank for your mobile devices"
    ],
    itinerary: [
      {
        dayNumber: 1,
        dayTheme: "Historic Foundations & Local Flavors",
        stops: [
          {
            id: "demo-stop-1",
            time: "09:00 AM",
            activity: "Explore the Historic Quarter",
            location: "Old Town District",
            description: "Wander through the preservation area to appreciate traditional architecture before the midday rush.",
            estimatedCost: "Free",
            duration: "2 hours",
            category: "Sightseeing"
          },
          {
            id: "demo-stop-2",
            time: "12:30 PM",
            activity: "Lunch at Central Food Market",
            location: "Market Hall",
            description: "Try local specialties, including freshly made street food, seasonal snacks, and green tea desserts.",
            estimatedCost: "$15 USD",
            duration: "1.5 hours",
            category: "Food"
          },
          {
            id: "demo-stop-3",
            time: "03:00 PM",
            activity: "Afternoon Landmark Visit",
            location: "Golden temple grounds",
            description: "Visit the iconic temple pavilion reflecting beautifully over the surrounding mirror pond.",
            estimatedCost: "$6 USD",
            duration: "2 hours",
            category: "Sightseeing"
          }
        ]
      },
      {
        dayNumber: 2,
        dayTheme: "Bamboo Paths & Scenic Panoramas",
        stops: [
          {
            id: "demo-stop-4",
            time: "08:30 AM",
            activity: "Bamboo Forest Walkway",
            location: "Forest Grove",
            description: "Stroll under towering stalks of bamboo as the morning sunlight filters through the green canopy.",
            estimatedCost: "Free",
            duration: "1.5 hours",
            category: "Relaxation"
          },
          {
            id: "demo-stop-5",
            time: "11:00 AM",
            activity: "Scenic River Cruise",
            location: "River Docking Station",
            description: "Board a traditional flat-bottom wooden boat navigated by local oarsmen through the scenic river valley.",
            estimatedCost: "$35 USD",
            duration: "2 hours",
            category: "Adventure"
          },
          {
            id: "demo-stop-6",
            time: "06:00 PM",
            activity: "Traditional Kaiseki Dinner",
            location: "Riverside Tavern",
            description: "Indulge in a multi-course dinner featuring seasonal local ingredients served in an elegant private room.",
            estimatedCost: "$80 USD",
            duration: "2.5 hours",
            category: "Food"
          }
        ]
      },
      {
        dayNumber: 3,
        dayTheme: "Mountain Views & Sunset Gates",
        stops: [
          {
            id: "demo-stop-7",
            time: "09:00 AM",
            activity: "Mountain Shrine Hike",
            location: "Mountain Base Shrine",
            description: "Hike up the hillside paths lined with thousands of bright red wooden shrine gates.",
            estimatedCost: "Free",
            duration: "3 hours",
            category: "Adventure"
          },
          {
            id: "demo-stop-8",
            time: "02:00 PM",
            activity: "Souvenir Shopping & Matcha Tea",
            location: "Traditional Bazar Lane",
            description: "Shop for handmade crafts, pottery, local spices, and stop for an authentic stone-ground matcha whisking demonstration.",
            estimatedCost: "$25 USD",
            duration: "2 hours",
            category: "Shopping"
          }
        ]
      }
    ]
  };
}
