import React from 'react';
import useTrip from './hooks/useTrip';
import Header from './components/Header';
import InputForm from './components/InputForm';
import Itinerary from './components/Itinerary';
import LoadingState from './components/LoadingState';
import ErrorPanel from './components/ErrorPanel';

export default function App() {
  const {
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
  } = useTrip();

  // Determine prompt text for retrying
  const handleRetry = () => {
    if (tripData?.destination) {
      // Re-run standard prompt with previous details if available
      const retryPrompt = `Destination: ${tripData.destination}
Duration: ${tripData.durationDays} days
Budget Level: ${tripData.budgetLevel || 'Moderate'}
Please generate a fresh travel itinerary adhering strictly to the schema layout.`;
      generateTrip(retryPrompt);
    } else {
      setError(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Header
        customApiKey={customApiKey}
        setCustomApiKey={setCustomApiKey}
        savedTrips={savedTrips}
        loadSavedTrip={loadSavedTrip}
        deleteSavedTrip={deleteSavedTrip}
        tripData={tripData}
        saveCurrentTrip={saveCurrentTrip}
        onReset={resetTrip}
      />

      <main className="app-main">
        {/* Main interactive area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%', overflowY: 'auto' }}>
          <div className="main-content">
            
            {loading ? (
              <LoadingState 
                status={loadingStatus} 
                onCancel={cancelGeneration} 
              />
            ) : error ? (
              <ErrorPanel
                error={error}
                onRetry={handleRetry}
                onManualLoad={loadManualJson}
                onReset={resetTrip}
              />
            ) : tripData ? (
              <Itinerary
                tripData={tripData}
                activeDay={activeDay}
                setActiveDay={setActiveDay}
                moveStop={moveStop}
                deleteStop={deleteStop}
                updateStop={updateStop}
                addStop={addStop}
                refineTrip={refineTrip}
                loading={loading}
                loadingStatus={loadingStatus}
              />
            ) : (
              <InputForm 
                onSubmit={generateTrip} 
                onDemoLoad={loadDemoTrip} 
              />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
