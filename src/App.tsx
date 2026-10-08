import { useState } from 'react';
import './App.css';
import { AircraftDetails } from './components/AircraftDetails/AircraftDetails';
import { AircraftList } from './components/AircraftList/AircraftList';
import { AircraftMap } from './components/AircraftMap/AircraftMap';
import { AircraftStatus } from './components/AircraftStatus/AircraftStatus';
import { AirportContext } from './components/AirportContext/AirportContext';
import { useAircraftPositions } from './hooks/useAircraftPositions';
import useAirportContext from './hooks/useAirportContext';

type SelectedLocation = {
  latitude: number;
  longitude: number;
  label: string;
};


export function App() {
  const {
    aircraftCount,
    aircraftData,
    aircraftTrails,
    errorMessage,
    isLoading,
    lastUpdatedAt,
  } = useAircraftPositions();
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    latitude: 50.85,
    longitude: 4.35,
    label: 'Brussels area',
  });
  const {
    airport,
    errorMessage: airportErrorMessage,
    isLoading: isAirportLoading,
    runways,
  } = useAirportContext({
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
  });
  const selectedAircraft =
    aircraftData?.features.find((feature) => feature.id === selectedAircraftId) ??
    null;

  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="page-title">
        <div className="status-panel-header">
          <p className="eyebrow">EBBR situational awareness</p>
          <h1 id="page-title">Airspace Pulse</h1>
          <AircraftStatus
            aircraftCount={aircraftCount}
            errorMessage={errorMessage}
            isLoading={isLoading}
            lastUpdatedAt={lastUpdatedAt}
          />
          <AirportContext
            airport={airport}
            errorMessage={airportErrorMessage}
            isLoading={isAirportLoading}
            label={selectedLocation.label}
            runways={runways}
          />
        </div>
        <div className="traffic-list-panel">
          {aircraftData && (
            <AircraftList
              features={aircraftData.features}
              selectedAircraftId={selectedAircraftId}
              onSelectAircraft={setSelectedAircraftId}
            />
          )}
        </div>
        <div className="selected-aircraft-panel">
          <AircraftDetails feature={selectedAircraft} />
        </div>
      </section>
      <section className="map-panel" aria-label="Aircraft map">
        <AircraftMap
          onSelectAircraft={setSelectedAircraftId}
          onSelectLocation={setSelectedLocation}
          aircraftData={aircraftData}
          aircraftTrails={aircraftTrails}
          airportRunways={runways}
          selectedLocation={selectedLocation}
          selectedAircraftId={selectedAircraftId}
        />
      </section>
    </main>
  );
}
