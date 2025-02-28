// components/LocationCard.js
import { useEffect, useState } from 'react';
import Map,{Marker} from 'react-map-gl/mapbox';

import 'mapbox-gl/dist/mapbox-gl.css';

const LocationCard = () => {
    const [viewport, setViewport] = useState({
        latitude: 41.3739,  // Barcelona latitude
        longitude: 2.1505,  // Barcelona longitude
        zoom: 13,
      });
  const [location, setLocation] = useState(null);

  // Mapbox access token (Replace with your own token)
  const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2F6YWlkaSIsImEiOiJjazNjNjM2dHowc2w1M2RrM2k5ZDczdGM5In0.D7s8oucuSsemZBRpYc84gA';

  useEffect(() => {
    // Get current location from geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setViewport((prevViewport) => ({
          ...prevViewport,
          latitude,
          longitude,
        }));
      });
    }
  }, []);

  if (!location) {
    return <div>Loading...</div>;
  }

  return (
    <div className='text-xl border-2  rounded-xl  text-black bg-white items-center p-4 '>
    Site Location
    <div style={{
        width: '90%',         // Parent container size (100% of the available space)
        height: '90%',       // Fixed height for the map container
        position: 'relative',  // Allow absolute positioning inside
        borderRadius: '20px',  // Rounded corners for the container
        overflow: 'hidden', 
        alignItems:"center",
        marginLeft:"auto",
        marginRight:"auto",
        marginTop:"10px"   
      }}>    
      
     
               <Map    initialViewState={viewport}
      mapboxAccessToken="pk.eyJ1Ijoic2F6YWlkaSIsImEiOiJjazNjNjM2dHowc2w1M2RrM2k5ZDczdGM5In0.D7s8oucuSsemZBRpYc84gA"
      style={{width: '100%', height: "100%"}}
      mapStyle="mapbox://styles/sazaidi/ckow1f4xy05id18pp2vm78red"
      attributionControl={false}
    >
        <Marker latitude={41.3739} longitude={2.1505} >
        </Marker>
        </Map>
  </div>
  </div>
  );
};

export default LocationCard;
