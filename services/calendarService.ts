import { MealPlan, UserPreferences, CalendarEvent } from '../types';

// Helper: Format ISODate to ICS format (yyyymmddThhmmss)
const formatICSTime = (isoString: string) => isoString.replace(/-|:|\.\d\d\d/g, "");

// Helper: Set time on a date object safely
const setDateWithTime = (date: Date, timeStr: string): Date => {
  const newDate = new Date(date);
  const [hours, minutes] = timeStr.split(':').map(Number);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

/**
 * Generates a list of calendar events based on the Meal Plan and User Preferences.
 */
export const generateCalendarEvents = (plan: MealPlan, prefs: UserPreferences): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const today = new Date();

  // 1. Grocery Shopping Event
  const shoppingDate = new Date(today);
  const cookingHour = parseInt(prefs.cookingSlot.split(':')[0]) || 19;
  const shoppingTimeStr = `${Math.max(9, cookingHour - 2)}:00`; // Shop 2 hours before cooking or at 9am
  
  const shoppingStart = setDateWithTime(shoppingDate, shoppingTimeStr);
  const shoppingEnd = new Date(shoppingStart.getTime() + 60 * 60 * 1000); // 1 hour duration

  events.push({
    title: `🛒 Grocery Run for ${plan.title}`,
    description: `Buy ingredients for: ${plan.title}\n\nItems:\n${plan.groceryList.map(c => `- ${c.category}: ${c.items.join(', ')}`).join('\n')}`,
    startTime: shoppingStart.toISOString(),
    endTime: shoppingEnd.toISOString(),
    location: `${prefs.cityType} Market`,
    type: 'shopping'
  });

  // 2. Cooking Events per Day
  plan.days.forEach((day, index) => {
    // Check if day is skipped
    if (day.scheduleOverride?.isSkipped) {
      const planDate = new Date(today);
      planDate.setDate(today.getDate() + index);
      const reminderStart = setDateWithTime(planDate, "09:00");
      const reminderEnd = setDateWithTime(planDate, "09:15");

      events.push({
        title: `⚠️ Ingredient Rescue: Day ${day.day} Skipped`,
        description: `You skipped cooking today. \n\nRescue Plan:\n${day.scheduleOverride.rescueNote || 'Check perishable items like dairy and greens.'}`,
        startTime: reminderStart.toISOString(),
        endTime: reminderEnd.toISOString(),
        type: 'reminder'
      });
      return; 
    }

    const planDate = new Date(today);
    planDate.setDate(today.getDate() + index);

    // Adaptive Scheduling: Override vs Default
    const timeToUse = day.scheduleOverride?.customTime || prefs.cookingSlot;
    const cookStart = setDateWithTime(planDate, timeToUse);
    
    // Duration based on user pref
    let durationMins = 45;
    if (prefs.cookingTimePerMeal.includes('15')) durationMins = 20;
    if (prefs.cookingTimePerMeal.includes('60')) durationMins = 75;

    const cookEnd = new Date(cookStart.getTime() + durationMins * 60 * 1000);

    const dayMeals = day.slots.map(s => s.recipe.title).join(', ');

    events.push({
      title: `👨‍🍳 Cook: ${dayMeals}`,
      description: `Prepare meals for Day ${day.day}.\n\nMenu:\n${day.slots.map(s => `[${s.meal}] ${s.recipe.title}`).join('\n')}\n\nPrep Notes:\n${plan.cookingSequence[index] || 'Check ingredients.'}`,
      startTime: cookStart.toISOString(),
      endTime: cookEnd.toISOString(),
      type: 'cooking'
    });
  });

  return events;
};

/**
 * Generates a Google Calendar Deep Link for a specific event.
 */
export const getGoogleCalendarLink = (event: CalendarEvent): string => {
  const start = formatICSTime(event.startTime);
  const end = formatICSTime(event.endTime);
  
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', event.title);
  url.searchParams.append('dates', `${start}/${end}`);
  url.searchParams.append('details', event.description);
  if (event.location) url.searchParams.append('location', event.location);
  
  return url.toString();
};

/**
 * Generates an .ics file content string for all events.
 */
export const generateICSFile = (events: CalendarEvent[]): string => {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CookingPro AI//Meal Planner//EN\n";

  events.forEach(event => {
    icsContent += "BEGIN:VEVENT\n";
    icsContent += `SUMMARY:${event.title}\n`;
    icsContent += `DTSTART:${formatICSTime(event.startTime)}\n`;
    icsContent += `DTEND:${formatICSTime(event.endTime)}\n`;
    icsContent += `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}\n`;
    if (event.location) icsContent += `LOCATION:${event.location}\n`;
    icsContent += "END:VEVENT\n";
  });

  icsContent += "END:VCALENDAR";
  return icsContent;
};

export const downloadICS = (filename: string, content: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], {type: 'text/calendar'});
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};