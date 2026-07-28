import { useState, useEffect, useRef } from 'react';
import { safeJsonParse } from '../utils/jsonRepair';
import { validateTripSchema, getDemoTripData } from '../utils/schema';

const API_BASE_URL = 'http://localhost:3000/api';
const LOCAL_STORAGE_KEY = 'odyssey_saved_trips';

export default function useTrip() {
  const [tripData, setTripData] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState(null);
  
  // Settings for custom API key
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('odyssey_api_key') || '';
  });

  // Track request IDs and abort controllers to prevent race conditions and handle slow responses
  const currentRequestId = useRef(0);
  const abortControllerRef = useRef(null);

  // Load saved trips from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedTrips(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load saved trips from localStorage", err);
    }
  }, []);

  // Save custom API key to localStorage when it changes
  useEffect(() => {
    if (customApiKey) {
      localStorage.setItem('odyssey_api_key', customApiKey);
    } else {
      localStorage.removeItem('odyssey_api_key');
    }
  }, [customApiKey]);

  // Cancel any running request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Set the headers, including custom API key if present
  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (customApiKey) {
      headers['x-api-key'] = customApiKey;
    }
    return headers;
  };

  // Safe wrapper for API calls that manages state, race conditions, JSON parsing, and schema validation
  const executeApiCall = async (endpoint, body) => {
    // 1. Cancel previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Increment request ID to track stale responses
    const thisRequestId = ++currentRequestId.current;

    setLoading(true);
    setError(null);
    setLoadingStatus('Contacting server...');

    try {
      // Simulate status updates for good UX
      const statusTimer1 = setTimeout(() => {
        if (currentRequestId.current === thisRequestId) {
          setLoadingStatus('AI is thinking...');
        }
      }, 1500);

      const statusTimer2 = setTimeout(() => {
        if (currentRequestId.current === thisRequestId) {
          setLoadingStatus('Structuring itinerary details...');
        }
      }, 5000);

      const statusTimer3 = setTimeout(() => {
        if (currentRequestId.current === thisRequestId) {
          setLoadingStatus('Reviewing category distributions and times...');
        }
      }, 12000);

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal
      });

      // Clear timers
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
      clearTimeout(statusTimer3);

      // Check if this request is stale
      if (currentRequestId.current !== thisRequestId) {
        return; // Ignore stale response
      }

      setLoadingStatus('Parsing response...');

      const contentType = response.headers.get('content-type') || '';
      
      // If server returned error code, parse the body for details
      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = { message: `HTTP Error ${response.status} (${response.statusText})` };
        }
        
        throw {
          type: 'API_ERROR',
          message: errData.message || 'API request failed.',
          rawOutput: errData.rawOutput || null,
          validationErrors: errData.validationErrors || null
        };
      }

      // Try reading as text to support repairing if parsing fails
      const rawText = await response.text();

      // Check again if request is stale
      if (currentRequestId.current !== thisRequestId) {
        return;
      }

      setLoadingStatus('Validating itinerary schema...');

      // Attempt safe JSON parse (with repair)
      let parsed;
      try {
        parsed = safeJsonParse(rawText);
      } catch (parseErr) {
        throw {
          type: 'JSON_PARSE_ERROR',
          message: parseErr.message,
          rawOutput: rawText
        };
      }

      // Validate schema
      try {
        validateTripSchema(parsed.data);
      } catch (validationErr) {
        throw {
          type: 'SCHEMA_VALIDATION_ERROR',
          message: validationErr.message,
          validationErrors: validationErr.validationErrors || [],
          rawOutput: parsed.repairedString || rawText
        };
      }

      // If successfully parsed and validated, update state
      setTripData(parsed.data);
      setActiveDay(1);
      setLoading(false);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log("Request aborted successfully.");
        return; // No state updates on abort
      }

      if (currentRequestId.current !== thisRequestId) {
        return; // Ignore stale errors
      }

      console.error("API call error details:", err);
      
      // package standard network fetch errors
      if (!err.type) {
        setError({
          type: 'NETWORK_ERROR',
          message: `Failed to reach server. Please check that your backend Express server is running on port 3000. Detail: ${err.message}`
        });
      } else {
        setError(err);
      }
      setLoading(false);
    }
  };

  // Generate a trip from scratch
  const generateTrip = (promptText) => {
    executeApiCall('generate', { prompt: promptText });
  };

  // Refine current trip
  const refineTrip = (refinementPrompt) => {
    if (!tripData) return;
    executeApiCall('refine', {
      currentItinerary: tripData,
      refinementPrompt: refinementPrompt
    });
  };

  // Abort ongoing loading request
  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setLoadingStatus('');
      setError({
        type: 'USER_CANCELED',
        message: 'Generation was canceled by the user.'
      });
    }
  };

  // Clear current trip and error
  const resetTrip = () => {
    setTripData(null);
    setError(null);
  };

  // Inject demo trip data for manual fallback or testing
  const loadDemoTrip = (destination) => {
    setLoading(true);
    setError(null);
    setLoadingStatus('Generating simulated trip...');
    setTimeout(() => {
      const data = getDemoTripData(destination);
      setTripData(data);
      setActiveDay(1);
      setLoading(false);
    }, 800);
  };

  // --- Itinerary Mutator Functions (Interactive Controls) ---

  // Reorder stops within a specific day (direction: -1 = up, 1 = down)
  const moveStop = (dayNumber, stopIndex, direction) => {
    if (!tripData) return;

    const newItinerary = tripData.itinerary.map(day => {
      if (day.dayNumber !== dayNumber) return day;

      const newStops = [...day.stops];
      const targetIndex = stopIndex + direction;

      // Bound checks
      if (targetIndex < 0 || targetIndex >= newStops.length) return day;

      // Swap
      const temp = newStops[stopIndex];
      newStops[stopIndex] = newStops[targetIndex];
      newStops[targetIndex] = temp;

      return { ...day, stops: newStops };
    });

    setTripData({ ...tripData, itinerary: newItinerary });
  };

  // Delete a stop by id
  const deleteStop = (dayNumber, stopId) => {
    if (!tripData) return;

    const newItinerary = tripData.itinerary.map(day => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        stops: day.stops.filter(stop => stop.id !== stopId)
      };
    });

    setTripData({ ...tripData, itinerary: newItinerary });
  };

  // Edit stop content (title/activity, description, location, time, cost, category)
  const updateStop = (dayNumber, stopId, updatedFields) => {
    if (!tripData) return;

    const newItinerary = tripData.itinerary.map(day => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        stops: day.stops.map(stop => {
          if (stop.id !== stopId) return stop;
          return { ...stop, ...updatedFields };
        })
      };
    });

    setTripData({ ...tripData, itinerary: newItinerary });
  };

  // Add a new manual stop to a day
  const addStop = (dayNumber, stopDetails) => {
    if (!tripData) return;

    const newStop = {
      id: `manual-stop-${Date.now()}`,
      time: stopDetails.time || '12:00 PM',
      activity: stopDetails.activity || 'New Activity',
      location: stopDetails.location || 'Local Spot',
      description: stopDetails.description || 'Description of the activity.',
      estimatedCost: stopDetails.estimatedCost || 'Free',
      duration: stopDetails.duration || '1 hour',
      category: stopDetails.category || 'Sightseeing'
    };

    const newItinerary = tripData.itinerary.map(day => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        stops: [...day.stops, newStop]
      };
    });

    setTripData({ ...tripData, itinerary: newItinerary });
  };

  // Manual JSON bypass: Load raw text JSON (used in the Error Panel's code editor)
  const loadManualJson = (jsonText) => {
    try {
      const parsed = JSON.parse(jsonText);
      validateTripSchema(parsed);
      setTripData(parsed);
      setActiveDay(1);
      setError(null);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        validationErrors: err.validationErrors || null
      };
    }
  };

  // --- Session Management (localStorage Sync) ---

  const saveCurrentTrip = () => {
    if (!tripData) return;

    const existingIndex = savedTrips.findIndex(t => t.id === tripData.tripTitle + '-' + tripData.destination);
    
    const tripToSave = {
      id: tripData.tripTitle + '-' + tripData.destination + '-' + Date.now(),
      savedAt: new Date().toISOString(),
      data: tripData
    };

    let updatedTrips = [...savedTrips];
    
    // Prevent duplicate entries
    const duplicateIndex = savedTrips.findIndex(t => t.data.tripTitle === tripData.tripTitle && t.data.destination === tripData.destination);
    if (duplicateIndex > -1) {
      updatedTrips[duplicateIndex] = tripToSave;
    } else {
      updatedTrips.unshift(tripToSave);
    }

    setSavedTrips(updatedTrips);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTrips));
  };

  const loadSavedTrip = (savedTripId) => {
    const target = savedTrips.find(t => t.id === savedTripId);
    if (target) {
      setTripData(target.data);
      setActiveDay(1);
      setError(null);
    }
  };

  const deleteSavedTrip = (savedTripId) => {
    const updatedTrips = savedTrips.filter(t => t.id !== savedTripId);
    setSavedTrips(updatedTrips);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTrips));
  };

  return {
    tripData,
    activeDay,
    setActiveDay,
    savedTrips,
    loading,
    loadingStatus,
    error,
    setError,
    customApiKey,
    setCustomApiKey,
    generateTrip,
    refineTrip,
    cancelGeneration,
    resetTrip,
    loadDemoTrip,
    // Mutations
    moveStop,
    deleteStop,
    updateStop,
    addStop,
    loadManualJson,
    // Saved Sessions
    saveCurrentTrip,
    loadSavedTrip,
    deleteSavedTrip
  };
}
