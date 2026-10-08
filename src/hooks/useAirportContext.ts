import React, {useEffect} from 'react';
import {
    fetchAirportRunways,
    fetchAirportWeather,
    fetchNearestAirport,
} from "../api/airports";
import type {
    AirportRunwayResponse,
    AirportWeatherResponse,
    NearestAirportResponse,
} from "../api/airports";

type UseAirportContextType = {
    latitude: number;
    longitude: number;
};

export type UseAirportContextResult = {
    airport: NearestAirportResponse | null;
    runways: AirportRunwayResponse[] | null;
    weather: AirportWeatherResponse | null;
    isLoading: boolean;
    errorMessage: string | null;
};

const useAirportContext = ({
    latitude,
    longitude,
}: UseAirportContextType): UseAirportContextResult => {
    const [airport, setAirport] = React.useState<NearestAirportResponse | null>(null);
    const [runways, setRunways] = React.useState<AirportRunwayResponse[] | null>(null);
    const [weather, setWeather] = React.useState<AirportWeatherResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchAirport(latitude: number, longitude: number) {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                setAirport(null);
                setRunways(null);
                setWeather(null);

                const airport = await fetchNearestAirport(latitude, longitude);

                if (!isMounted) {
                    return;
                }

                if(airport) {
                    const [runways, weather] = await Promise.all([
                        fetchAirportRunways(airport.source, airport.sourceAirportId),
                        fetchAirportWeather(airport.source, airport.sourceAirportId),
                    ]);

                    if (!isMounted) {
                        return;
                    }

                    setRunways(runways);
                    setWeather(weather);
                    setAirport(airport);
                } else {
                    setRunways(null);
                    setWeather(null);
                    setAirport(null);
                }
            } catch {
                if (!isMounted) {
                    return;
                }

                setAirport(null);
                setRunways(null);
                setWeather(null);
                setErrorMessage('Could not load airport context.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }
        void fetchAirport(latitude, longitude);

        return () => {
            isMounted = false;
        };
    }, [latitude, longitude]);

    return { airport, runways, weather, isLoading, errorMessage};
};

export default useAirportContext;
