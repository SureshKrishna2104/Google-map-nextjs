
import { useLoadScript ,LoadScript} from "@react-google-maps/api";
import Map from "../components/Map";
const lib = ['places'];
const key = ''; 
const Home = () => {
  return <LoadScript googleMapsApiKey={key} libraries={lib}>
  <Map />
  </LoadScript> ;
};

export default Home;

