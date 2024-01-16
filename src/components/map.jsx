import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, OverlayView, useJsApiLoader, useLoadScript } from '@react-google-maps/api';
import Supercluster from 'supercluster';
import useSWR from 'swr';


const containerStyle = { width: '100%', height: '700px' };
const libraries = ['places'];
// const center = { lat: 13.466085105558912, lng: 77.73331020894456 };
const options = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  maxZoom: 20,
  minZoom: 6,
};


const sc = new Supercluster({ radius: 40, maxZoom: options.maxZoom });

function fetcher() {
  const result = [
    {
      id: 0,
      brand: 'audi0',
      model: 'audiQ30',
      year: '2000',
      available: true,
      position: [13.466085105558912, 77.73331020894456]
    },
    {
      id: 1,
      brand: 'audi1',
      model: 'audiQ31',
      year: '2001',
      available: true,
      position: [12.95788820175097, 77.58390327882123]
    },
    {
      id: 2,
      brand: 'audi2',
      model: 'audiQ32',
      year: '2002',
      available: true,
      position: [13.004725002500436, 77.60724922628067]
    },
    {
      id: 3,
      brand: 'audi3',
      model: 'audiQ33',
      year: '2003',
      available: true,
      position: [13.01007721735396, 77.68827339687519]
    },
    {
      id: 4,
      brand: 'audi4',
      model: 'audiQ34',
      year: '2004',
      available: true,
      position: [13.01944331535719, 77.71848579946976]
    },
    {
      id: 5,
      brand: 'audi5',
      model: 'audiQ35',
      year: '2005',
      available: true,
      position: [13.026133168633054, 77.70063301611843]
    },
    {
      id: 6,
      brand: 'audi6',
      model: 'audiQ36',
      year: '2006',
      available: true,
      position: [13.000359483416068, 80.21337170469852]
    },
    {
      id: 7,
      brand: 'audi7',
      model: 'audiQ37',
      year: '2007',
      available: true,
      position: [16.719250199249043, 80.69689593470342]
    },
    {
      id: 8,
      brand: 'audi8',
      model: 'audiQ38',
      year: '2008',
      available: true,
      position: [17.434379014745925, 78.43930837207745]
    },
    {
      id: 9,
      brand: 'audi9',
      model: 'audiQ39',
      year: '2009',
      available: true,
      position: [17.443351483427648, 78.4045108474762]
    },
    {
      id: 10,
      brand: 'audi10',
      model: 'audiQ310',
      year: '20010',
      available: true,
      position: [17.465780723259623, 78.36313000740988]
    },
    {
      id: 11,
      brand: 'audi11',
      model: 'audiQ311',
      year: '20011',
      available: true,
      position: [17.490898192327553, 78.39322516382175]
    },
    {
      id: 12,
      brand: 'audi12',
      model: 'audiQ312',
      year: '20012',
      available: true,
      position: [17.493589144031738, 78.3885227956324]
    },
    {
      id: 13,
      brand: 'audi13',
      model: 'audiQ313',
      year: '20013',
      available: true,
      position: [17.542019458202457, 78.48915347488463]
    },
    {
      id: 14,
      brand: 'audi14',
      model: 'audiQ314',
      year: '20014',
      available: true,
      position: [19.27667027566156, 72.97951961620981]
    },
    {
      id: 15,
      brand: 'audi15',
      model: 'audiQ315',
      year: '20015',
      available: true,
      position: [19.22737208239833, 72.97429777771781]
    },
    {
      id: 16,
      brand: 'audi16',
      model: 'audiQ316',
      year: '20016',
      available: true,
      position: [21.46369388579668, 81.60653662854442]
    },
    {
      id: 17,
      brand: 'audi17',
      model: 'audiQ317',
      year: '20017',
      available: true,
      position: [20.54244759358051, 85.75625153846832]
    }
  ]
  return result;
};


function formatDataToGeoJsonPoints(data) {
  return data.map((vehicle) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [vehicle.position[1], vehicle.position[0]] },
    properties: { cluster: false, ...vehicle },
  }));
}

function getLabel(pointCount) {
  return { text: pointCount.toString(), color: '#353535', fontWeight: 'bold' };
}

function App() {
  const { isLoaded: isMapLoaded } = useJsApiLoader({ googleMapsApiKey: '' });
  const [zoom, setZoom] = useState(options.minZoom);
  const [bounds, setBounds] = useState([0, 0, 0, 0]);
  const [clusters, setClusters] = useState();
  const [center, setCenter] = useState({ lat: 13.466085105558912, lng: 77.73331020894456 })
  const mapRef = useRef();
  const { data, error, isLoading: isDataLoading } = useSWR('vehicles', fetcher);
  const [service, setService] = useState()
  const [autocomplete,setAutocomplete]=useState()
  const [query, setQuery] = useState('')
  const timerRef = useRef();

  useEffect(() => {
    if (data?.length && mapRef.current) {
      sc.load(formatDataToGeoJsonPoints(data));
      setClusters(sc.getClusters(bounds, zoom));
    }
  }, [data, bounds, zoom]);

  useEffect(() => {
    if (query.length != 0) {
    timerRef.current=setTimeout(()=>{
      handlePlaceSearch()
    },1000)

    return () =>clearTimeout(timerRef.current)
  }
  }, [query])

  if (error) {
    return <div className="container pt-5"><h2 className="text-center">Error loading data</h2></div>;
  }

  if (isDataLoading) {
    return <div className="container pt-5"><h2 className="text-center">Loading...</h2></div>;
  }

  if (!isMapLoaded) return null;

  function handleClusterClick({ id, lat, lng }) {
    const expansionZoom = Math.min(sc.getClusterExpansionZoom(id), 20);
    mapRef.current?.setZoom(expansionZoom);
    mapRef.current?.panTo({ lat, lng });
  }

  function handleBoundsChanged() {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds()?.toJSON();
      setBounds([bounds?.west || 0, bounds?.south || 0, bounds?.east || 0, bounds?.north || 0]);
    }
  } 

  function handleZoomChanged() {
    if (mapRef.current) {
      setZoom(mapRef.current?.getZoom());
    }
  }
  function handlePlaceSearch() {
    let request = {
      query: query,
      fields: ['name', 'geometry'],
    };
    const options = {
      componentRestrictions: { country: "ng" },
      fields: ["address_components", "geometry", "icon", "name"],
      types: ["establishment"]
     };
  // let places=autocomplete(query,options)
  // console.log(autocomplete.getPlace(query,options),"places")
    service.findPlaceFromQuery(request, (results, status) => {
      console.log(status === google.maps.places.PlacesServiceStatus.OK, google.maps.places.PlacesServiceStatus.OK, "ddd")
      // console.log(request,results,status)
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          // coords.push(results[i]);
        }
        setCenter(results[0].geometry.location);

      }
    });
  }
  function handleMapLoad(map) {
    mapRef.current = map;
    let service = new google.maps.places.PlacesService(map);
    let autocomplete=new google.maps.places.Autocomplete(map);
    setService(service)
    setAutocomplete(autocomplete)
    // console.log(service.findPlaceFromQuery())

  }
  // console.log(service,"service")

  return (
    <div className="container pt-5">
      <div className="input-group input-group-sm mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="inputGroup-sizing-sm">Search by place</span>
        </div>
        <input type="text" className="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="col-12">
        <GoogleMap
          onLoad={handleMapLoad}
          onBoundsChanged={handleBoundsChanged}
          onZoomChanged={handleZoomChanged}
          mapContainerStyle={containerStyle}
          options={options}
          center={center}
          zoom={zoom}
        >
          {clusters?.map(({ id, geometry, properties }) => {
            const [lng, lat] = geometry.coordinates;
            const { cluster, point_count, brand, model, year, available } = properties;

            return cluster ? (
              <Marker
                key={`cluster-${id}`}
                onClick={() => handleClusterClick({ id: id, lat, lng })}
                position={{ lat, lng }}
                icon="/images/cluster-pin.png"
                label={getLabel(point_count)}
              />
            ) : (
              <VehicleMarker
                key={`vehicle-${properties.id}`}
                position={{ lat, lng }}
                brand={brand}
                model={model}
                year={year}
                available={available}
              />
            );
          })}
        </GoogleMap>
      </div>
    </div>
  );
}

function getPixelPositionOffset(width, height) {
  return { x: -(width / 2), y: -(height / 2) };
}

function VehicleMarker({ position, brand, model, year, available }) {
  const [visible, setVisible] = useState(false);
  const buttonClass = available ? 'success' : 'warning';
  const buttonText = available ? 'Book' : 'Reserved';
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={getPixelPositionOffset}
    >
      <div style={{ position: 'absolute', left: '-16.9052px', top: '4.63753px' }}>
        <div className={`card ${visible ? 'd-block' : 'd-none'}`} style={{ right: '38%', minWidth: 250, zIndex: 1000, marginTop: -175 }}>
          <div className="card-header bg-secondary p-1">
            <img src={`https://via.placeholder.com/250x100?text=${brand}+${model}+${year}`} alt={`${brand} ${model} - ${year}`} />
            <h6 className="mt-1 mb-0">{brand} {model} - {year}</h6>
          </div>
          <div className="card-body d-flex p-1">
            <button className="btn btn-sm btn-secondary w-50 p-0" onClick={() => setVisible(false)}>
              Close
            </button>
            <div style={{ width: 4 }} />
            <button className={`btn btn-sm btn-${buttonClass} text-light w-50 p-0`}>
              {buttonText}
            </button>
          </div>
        </div>
        <button className={`btn btn-none`} onClick={() => setVisible(true)}>
          <img src="/images/cs-pin.png" alt="CarSharing Pin" />
        </button>
      </div>
    </OverlayView>
  );
}

export default App;
