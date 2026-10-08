export type NearestAirportResponse = {
  source: string;
  sourceAirportId: string;
  ident: string;
  name: string;
  type: string;
  latitudeDeg: number;
  longitudeDeg: number;
  importedAt: string;
  distanceKm: number;
};

export type AirportRunwayResponse = {
  source: string;
  sourceRunwayId: string;
  sourceAirportId: string;
  airportIdent: string;
  lengthFt: number | null;
  widthFt: number | null;
  surface: string | null;
  leIdent: string | null;
  heIdent: string | null;
  leLatitudeDeg: number | null;
  leLongitudeDeg: number | null;
  heLatitudeDeg: number | null;
  heLongitudeDeg: number | null;
  lighted: boolean;
  closed: boolean;
  importedAt: string;
};

export type AirportWeatherResponse = {
  airportIdent: string;
  metar: string;
  taf: string;
  observedAt: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
};

const MOCK_WEATHER_BY_AIRPORT_ID: Record<string, AirportWeatherResponse> = {
  '2155': {
    airportIdent: 'EBBR',
    metar: 'EBBR 080925Z 24012KT 9999 FEW045 SCT250 14/06 Q1018 NOSIG',
    taf: 'EBBR 080500Z 0806/0912 24010KT 9999 SCT040 TEMPO 0808/0816 24015G25KT -SHRA BKN025',
    observedAt: '2026-10-08T09:25:00.000Z',
    flightCategory: 'VFR',
  },
  '302578': {
    airportIdent: 'EBCI',
    metar: 'EBCI 080920Z 25010KT 8000 -RA BKN012 OVC030 12/09 Q1016',
    taf: 'EBCI 080500Z 0806/0912 25012KT 8000 -RA BKN015 TEMPO 0806/0814 4000 RA BKN008',
    observedAt: '2026-10-08T09:20:00.000Z',
    flightCategory: 'MVFR',
  },
};

export async function fetchAirportWeather(
  source: string,
  sourceAirportId: string,
): Promise<AirportWeatherResponse | null> {
  await delay(200);

  if (source !== 'ourairports') {
    return null;
  }

  return MOCK_WEATHER_BY_AIRPORT_ID[sourceAirportId] ?? null;
}

const MOCK_AIRPORTS: readonly NearestAirportResponse[] = [
  {
    source: 'ourairports',
    sourceAirportId: '2155',
    ident: 'EBBR',
    name: 'Brussels Airport',
    type: 'large_airport',
    latitudeDeg: 50.9014,
    longitudeDeg: 4.4844,
    importedAt: '2026-10-08T09:00:00.000Z',
    distanceKm: 0,
  },
  {
    source: 'ourairports',
    sourceAirportId: '302578',
    ident: 'EBCI',
    name: 'Brussels South Charleroi Airport',
    type: 'large_airport',
    latitudeDeg: 50.4592,
    longitudeDeg: 4.4538,
    importedAt: '2026-10-08T09:00:00.000Z',
    distanceKm: 0,
  },
];

const MOCK_RUNWAYS_BY_AIRPORT_ID: Record<string, AirportRunwayResponse[]> = {
  '2155': [
    {
      source: 'ourairports',
      sourceRunwayId: '233635',
      sourceAirportId: '2155',
      airportIdent: 'EBBR',
      lengthFt: 9800,
      widthFt: 164,
      surface: 'ASP',
      leIdent: '01',
      heIdent: '19',
      leLatitudeDeg: 50.886902,
      leLongitudeDeg: 4.49142,
      heLatitudeDeg: 50.912899,
      heLongitudeDeg: 4.50202,
      lighted: true,
      closed: false,
      importedAt: '2026-10-08T09:00:00.000Z',
    },
    {
      source: 'ourairports',
      sourceRunwayId: '233637',
      sourceAirportId: '2155',
      airportIdent: 'EBBR',
      lengthFt: 11936,
      widthFt: 148,
      surface: 'ASP',
      leIdent: '07L',
      heIdent: '25R',
      leLatitudeDeg: 50.897701,
      leLongitudeDeg: 4.46472,
      heLatitudeDeg: 50.904999,
      heLongitudeDeg: 4.51442,
      lighted: true,
      closed: false,
      importedAt: '2026-10-08T09:00:00.000Z',
    },
    {
      source: 'ourairports',
      sourceRunwayId: '233636',
      sourceAirportId: '2155',
      airportIdent: 'EBBR',
      lengthFt: 10535,
      widthFt: 148,
      surface: 'ASP',
      leIdent: '07R',
      heIdent: '25L',
      leLatitudeDeg: 50.890301,
      leLongitudeDeg: 4.46058,
      heLatitudeDeg: 50.896198,
      heLongitudeDeg: 4.50451,
      lighted: true,
      closed: false,
      importedAt: '2026-10-08T09:00:00.000Z',
    },
  ],
  '302578': [
    {
      source: 'ourairports',
      sourceRunwayId: '270774',
      sourceAirportId: '302578',
      airportIdent: 'EBCI',
      lengthFt: 8366,
      widthFt: 148,
      surface: 'ASP',
      leIdent: '06',
      heIdent: '24',
      leLatitudeDeg: 50.453999,
      leLongitudeDeg: 4.43489,
      heLatitudeDeg: 50.463299,
      heLongitudeDeg: 4.46962,
      lighted: true,
      closed: false,
      importedAt: '2026-10-08T09:00:00.000Z',
    },
  ],
};

export async function fetchNearestAirport(
  latitude: number,
  longitude: number,
): Promise<NearestAirportResponse | null> {
  await delay(250);

  const nearestAirport = MOCK_AIRPORTS.reduce<NearestAirportResponse | null>(
    (closestAirport, airport) => {
      const candidate = {
        ...airport,
        distanceKm: calculateDistanceKm(
          latitude,
          longitude,
          airport.latitudeDeg,
          airport.longitudeDeg,
        ),
      };

      if (!closestAirport || candidate.distanceKm < closestAirport.distanceKm) {
        return candidate;
      }

      return closestAirport;
    },
    null,
  );

  return nearestAirport;
}

export async function fetchAirportRunways(
  source: string,
  sourceAirportId: string,
): Promise<AirportRunwayResponse[] | null> {
  await delay(250);

  if (source !== 'ourairports') {
    return [];
  }

  return MOCK_RUNWAYS_BY_AIRPORT_ID[sourceAirportId] ?? [];
}

function calculateDistanceKm(
  inputLatitude: number,
  inputLongitude: number,
  airportLatitude: number,
  airportLongitude: number,
): number {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(airportLatitude - inputLatitude);
  const longitudeDelta = toRadians(airportLongitude - inputLongitude);
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(inputLatitude)) *
      Math.cos(toRadians(airportLatitude)) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
