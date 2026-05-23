import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import '@/lib/leaflet-fix'

interface Props {
  lat: number
  lng: number
  label: string
}

export function EventMap({ lat, lng, label }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ height: '220px', border: '1px solid #E2E8F0' }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}