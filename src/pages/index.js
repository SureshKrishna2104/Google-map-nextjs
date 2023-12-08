// import type { NextPage } from "next";
import { useLoadScript } from "@react-google-maps/api";
import Map from "../components/Map";

const Home = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "", // Add your API key
  });

  return isLoaded ? <Map /> : null;
};

export default Home;