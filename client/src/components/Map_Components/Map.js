import React, { Component } from 'react';
import './Map.css'

class Map extends Component {

  state = {
    sfPosition : {
      lat: 37.775,
      lng: -122.410
    },
    zoom: 12.5,
    infowindow: undefined,
    google_place : [
      {
        address: "982 Market St, San Francisco, CA 94102, USA",
        icon: "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAAEPbpPmfI-5w-b1IUY8pCLhxHzMDR9ypZxB6a-DVWgaXt1R91x2jjKMHXRmyLKg_OF2iCdgkxzsWmTjpc19VEc-_MWePKVU09NGTBOtZjtjFIPSQnVsLLlS2yrj7thBbNEhAbdZz8RpaZ4ZgpFNs7boW0GhSp-RsscMdSBMODnMkknfHBN3sfuw&3u5312&5m1&2e1&callback=none&key=AIzaSyBp1zbhrcngsbN8eIBJsrxBH2FGrsyHNjs&token=63583",
        lat: 37.7826737,
        lng: -122.41042800000002,
        name: "The Warfield",
        phone: "+1 415-345-0900",
        photos: [
        ],
        place_id: "ChIJ26vXqYWAhYAR-pHMSmLA0nA",
        price_level: 3
      }, {
        address: "652 Polk St, San Francisco, CA 94102, USA",
        icon: "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAAy-HzOw1J-KW35H_EesxQSEENokJIu37_ibNulHHe7Pao4YSytw3NTuPjT3-ZOKcWCV2rK5pNHJKidLCYdGDhjdtphx-CI5O1yu6hh5X2YlrXiTcieBI5u6jYIFj1xO1nEhBi5MUHteFu2yZYuvQYaJ3SGhRIss9pECw3_d8ho2lEonqHKt2HTQ&3u1267&5m1&2e1&callback=none&key=AIzaSyBp1zbhrcngsbN8eIBJsrxBH2FGrsyHNjs&token=26619",
        lat: 37.7829023,
        lng: -122.41903580000002,
        name: "Brenda's French Soul Food",
        phone: "+1 415-345-8100",
        photos: [],
        place_id: "ChIJZ9s5SJeAhYARIX3Fxl6oj6c",
        price_level: 2,
      }, {
        address: "Twin Peaks, San Francisco, CA, USA",
        icon: "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAAg408CS6CSSZRaE7l7j2qlJt7rosM9p5htHQcP3058Lucvk20XC1PwNc_R7N0EqK-OFFVAz243hpDitAZbhItZHX7offn0JKOQZPRFhjJSqZ7-eJ_YpPFgczrnQNSLibMEhDT4bTgp5TYvJD_MRRYPbxlGhQ2q-xkekgn7JGytcXPuMtEf5Hdow&3u1600&5m1&2e1&callback=none&key=AIzaSyBp1zbhrcngsbN8eIBJsrxBH2FGrsyHNjs&token=67600",
        lat: 37.7544066,
        lng: -122.44768449999998,
        name: "Twin Peaks",
        phone: undefined,
        photos: [],
        place_id: "ChIJp71fQgh-j4ARV7YEtWUmni0",
        price_level: undefined,
      }
    ]
  }

  // Lifecycle Event
  componentDidMount() {
    // TODO Render Map Specific Markers
    this.getPlaces( this.props.map_id );
  }

  getPlaces = (map_id) => {
    // TODO Query DB to get places associated with map ID
    // As of now we have existing places
    this.renderMap(); // This should be called after the API call
  }

  renderMap = () => {
    this.loadGoogleMapsScript(`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}js&callback=initMap&libraries=places`);
    window.initMap = this.initMap;
  }

  loadGoogleMapsScript = (url) => {
    // Select first Script tag on page.
    let index = window.document.getElementsByTagName("script")[0];

    // Create New Script Tag for Google Maps API
    let script = window.document.createElement("script");
    script.src = url;
    script.async = true;
    script.defer = true;

    // Prepend Google Maps API Script to the first of list of scripts
    index.parentNode.insertBefore(script, index);
  }

  initMap = () => {
    const map = this.createNewMap();

    this.setState({ infowindow: new window.google.maps.InfoWindow() });

    window.clickedViewMore = this.clickedViewMore
    window.clickedAddToMap = this.clickedAddToMap
    window.clickedRemoveFromMap = this.clickedRemoveFromMap

    this.addSearchBoxAndAutoComplete( map );

    this.renderSavedPlaces( map );
  }

  // TODO - Delete this later or change to modal
  clickedViewMore = (place_id) => {
    let index = this.state.google_place.map((place) => { return place.place_id; }).indexOf(place_id);
    alert(this.state.google_place[index].name);
  }

  createNewMap = () => {
    return new window.google.maps.Map(document.getElementById('map'), {
      center: this.state.sfPosition,
      zoom: this.state.zoom,
      clickableIcons: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        mapTypeIds: ['roadmap', 'satellite']
      }
    });
  }

  addSearchBoxAndAutoComplete = ( map ) => {
    // Create the search box and link it to the UI element
    let input = document.getElementById('pac-input');
    let searchBox = new window.google.maps.places.SearchBox(input);
    map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bound the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', () => {
      let places = searchBox.getPlaces();
      // Close any open info windows
      this.state.infowindow.close();

      if (places.length === 0) {
        return;
      }

      // For each place, get the icon, name and location.
      let bounds = new window.google.maps.LatLngBounds();

      places.forEach((place) => {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }

        let place_photos = this.getPlacePhotos(place);

        let newPlace = {
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          phone: place.international_phone_number,
          price_level: place.price_level,
          photos: place_photos,
          icon: place_photos[0]
        }

        this.addNewPlaceToState(newPlace);

        // Create a marker and set its content
        this.setMarkerInfoWindow(map, this.getMarker(map, newPlace), newPlace, false)

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  }

  renderSavedPlaces = ( map ) => {
    this.state.google_place.map((place) => {
      this.setMarkerInfoWindow(map, this.getMarker(map, place), place, true);
    });
  }

  getMarker = ( map, place ) => {
    return new window.google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map: map,
      title: place.name,
    });
  }

  getPlacePhotos = (place) => {
    let place_photos = [];

    place.photos.forEach((photo) => {
      place_photos.push(photo.getUrl());
    });

    return place_photos;
  }

  addNewPlaceToState = (place) => {
    let updated_google_place = this.state.google_place.slice();

    updated_google_place.push(place);

    this.setState({
      google_place: updated_google_place
    });
  }

  setMarkerInfoWindow = ( map,  marker, place, saved) => {
    marker.addListener('click', () => {
      // Change content
      this.state.infowindow.setContent(this.getContentString(place, saved));
      // Open info window
      this.state.infowindow.open(map, marker);
    })
  }

  getContentString = ( place, saved ) => {
    return `<div class="row">
              <div class="column">
                ${(place.icon !== undefined ? `<img class="icon" src="${place.icon}" alt="Icon of Place">` : ``)}
              </div>
              <div class="column">
                <strong>${place.name}</strong>
                <p>${(place.address !== undefined ? place.address : 'Address: N/A')}</p>
                <p>${(place.phone !== undefined ? place.phone : 'Phone #: N/A')}</p>
                <p>${(place.price_level !== undefined ? "<strong>Price Range:</strong> " + "$".repeat(place.price_level) : 'Price Range: N/A')}</p>
                <button onclick="clickedViewMore(\'${place.place_id}\')">View Conversation</button>
                ${ (saved === true) ? `<button onclick="clickedRemoveFromMap(\'${place.place_id}\')">Remove</button>`: `<button onclick="clickedAddToMap(\'${place.place_id}\')">Add</button>`}                
            </div>`;
  }

  clickedAddToMap = (place_id) => {
    let index = this.state.google_place.map((place) => { return place.place_id; }).indexOf(place_id);

    fetch(`/map/add/:mapId/${this.state.google_place[index].place_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.google_place[index])

    }).then(( response ) => {
      // TODO different stuff based on response
      console.log(response);
    });
  }

  clickedRemoveFromMap = () => {

  }

  render() {
    return (
      <div 
        id="mapContainer" 
        clasName="mapContainer"
        style={mapContainerStyle} 
      >
        {/* Search Box */}
        <input 
          id="pac-input"
          className ="controls searchBox"
          type="text"
          placeholder="Search Here"
        ></input>

        {/* Map */}
        <div 
          id="map"
        ></div>
      </div>
    );
  }
}

var mapContainerStyle = {
  height: '100%',
  overflow: 'hidden',
};

export default Map;