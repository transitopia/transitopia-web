import './App.css';
import "maplibre-gl/dist/maplibre-gl.css";
import { Route } from "wouter";

import { Map } from "./Map/Map.tsx";
import { CyclingMap } from './CyclingMap/CyclingMap.tsx';
import { LinkWithQuery } from './components/LinkWithQuery.tsx';
import { Icon } from './components/Icon.tsx';

function App() {

    return (
        <>
            <Map>
                <div className="absolute w-96 bg-white z-50 top-5 left-5 border border-gray-500 rounded shadow-md p-2 flex items-center">
                    <img src="/transitopia-logo-h.svg" alt="Transitopia" className='block h-10 mr-4' />
                    <LinkWithQuery href="/transit" className="mx-1 p-1  w-8 h-8 text-center rounded-full bg-gray-50 hover:bg-gray-100" classNameActive="!bg-transitBlue"><Icon icon="bus-front-fill" altText="Transit" /></LinkWithQuery>
                    <LinkWithQuery href="/pedestrian" className="mx-1 p-1 w-8 h-8 text-center rounded-full bg-gray-50 hover:bg-gray-100" classNameActive="!bg-pedestrianOrange"><Icon icon="person-walking" altText="Walking" /></LinkWithQuery>
                    <LinkWithQuery href="/cycling" className="mx-1 p-1  w-8 h-8 text-center rounded-full bg-gray-50 hover:bg-gray-100" classNameActive="!bg-cyclistGreen"><Icon icon="bicycle" altText="Cycling" /></LinkWithQuery>
                </div>
                <Route path="/cycling"><CyclingMap /></Route>
            </Map>
        </>
    )
}

export default App
