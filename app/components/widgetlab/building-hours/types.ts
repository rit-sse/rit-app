/**
 * A campus location in the "All Locations" list. The locations endpoint carries
 * no schedule, so there is no open/closed state to show here.
 */
export interface locationType {
  id: string;
  name: string;
  image?: string;
  link?: string;
}

/** A location in the featured carousel, with live hours attached. */
export interface featuredLocationType {
  id: string;
  name: string;
  open: boolean;
  /** Line shown under the name, e.g. "Today 6am - 8pm" or "Closed today" */
  hours: string;
}

/** One entry in the /building-hours/livetime response's `data` object. */
export interface liveLocationType {
  /** Weekday name -> raw hours string, e.g. { Monday: "6am - 8pm" } */
  hours: Record<string, string>;
  /** Derived server-side from the server's clock. */
  closed: boolean;
}
