import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Store = {
  id: string;
  name: string;
  city: string;
  coordinates: LatLngExpression;
  address: string;
};

const STORE_LOCATIONS: Store[] = [
  {
    id: 'ist',
    name: 'Marmara Hub',
    city: 'İstanbul',
    coordinates: [41.015137, 28.97953],
    address: 'Galata Mah. 34421',
  },
  {
    id: 'ank',
    name: 'Anadolu Deposu',
    city: 'Ankara',
    coordinates: [39.933365, 32.859741],
    address: 'Kızılay Mah. 06420',
  },
  {
    id: 'izm',
    name: 'Ege Lojistik',
    city: 'İzmir',
    coordinates: [38.423733, 27.142826],
    address: 'Konak Mah. 35250',
  },
];

const defaultIcon = L.icon({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const HeavyMap: React.FC = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4 text-center">Depo ve Mağaza Konumlarımız</h3>
    <MapContainer
      center={[39.0, 34.5]}
      zoom={5}
      scrollWheelZoom={false}
      className="h-96 w-full rounded-lg shadow-inner"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {STORE_LOCATIONS.map((store) => (
        <Marker position={store.coordinates} key={store.id} icon={defaultIcon}>
          <Popup>
            <p className="font-semibold">{store.name}</p>
            <p>{store.city}</p>
            <p className="text-xs text-gray-500">{store.address}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
);

export default HeavyMap;
