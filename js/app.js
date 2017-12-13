var data = {
  locations: ko.observableArray([
    new Location('Xoxo Burguer',                  { lat: -12.9668469, lng: -38.4653078 }),
    new Location('Cazolla Gastrô Burguer Beer',   { lat: -12.9895604, lng:-38.4617357 }),
    new Location('RED Burger N Bar',              { lat: -12.9990172, lng: -38.4622255 }),
    new Location('BRAVO - Burger & Beer',         { lat: -12.9940189, lng: -38.461848 } ),
    new Location('Atelier Garage Bar',            { lat: -12.9700962, lng: -38.4879189 } ),
    new Location('Muu Hamburgueria',              { lat: -12.9902217, lng: -38.4576983 } )
  ])
};

function Location(title, coordinates) {
  this.title = title;
  this.coordinates = coordinates;


  this.getFoursquareData = function () {
    let url = 'https://api.foursquare.com/v2/venues/search?v=20171112' +
      '&ll=' + this.coordinates.lat + ',' + this.coordinates.lng +
      '&query=' + this.title +
      '&client_id=' + viewModel.config.FORSQUARE_CLIENT_ID +
      '&client_secret=' + viewModel.config.FORSQUARE_CLIENT_SECRET +
      '&limit=1';

    $.getJSON(url).done(function(response) {
      let venues = response.response.venues;

      info = venues[0];

      console.log( info.id );
      console.log(info.contact);
      console.log(info.location.formattedAddress.join(', '));
    }).fail(function () {
      //show error message
      //test by inserting error in url
      console.log('oops');
    });
  }
}

var viewModel = {
  config: {
    FORSQUARE_CLIENT_ID: 'XU0HWTQITZBSMD2HJDPOKQTYRFBVWPCY4QAM03KG0LKVVSS2',
    FORSQUARE_CLIENT_SECRET: 'KWFQ22SUYMKL4JYPKJMT5CKHZRNZJPWBRLN5FDL52FKGO5MU'
  },

  query: ko.observable(""),
  map,
  initMap: function () {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: -12.9730401, lng: -38.5023039 },
      zoom: 16
    });

    this.createMarkers();
  },

  createMarkers: function () {
    let bounds = new google.maps.LatLngBounds();

    data.locations().forEach(function (location, index) {
      let marker = new google.maps.Marker({
        position: location.coordinates,
        map: map,
        title: location.title,
        animation: google.maps.Animation.DROP,
        id: index
      });

      bounds.extend(marker.position);

      marker.addListener('click', function () {
        viewModel.highlightLocation(location);
      });

      location.marker = marker;
      this.map.fitBounds(bounds);
    });
  },

  showInfoWindow: function (location) {
    let infoWindow = new google.maps.InfoWindow()
    let marker = location.marker;

    if(infoWindow.marker != marker) {
      infoWindow.marker = marker;
      infoWindow.setContent('<div>' + marker.title + '</div>');

      infoWindow.open(viewModel.map, marker);
    }

    location.getFoursquareData();
  },

  highlightLocation: function (location) {
    let marker = location.marker;

    //TODO Change color
    marker.setAnimation(google.maps.Animation.BOUNCE);

    setTimeout(function () {
      marker.setAnimation(null);
    }, 3200);

    viewModel.showInfoWindow(location);
  },

  showMarkers: function () {
    ko.utils.arrayForEach(data.locations(), function (location) {
      if(location.marker) {
        location.marker.setVisible(true);
      }
    });
  },

  //TODO: test it blocking the google site on hosts file
  showError: function(message) {
    alert(message);
  }
};

/*
 * Filtering the list of locations.
 */
viewModel.filteredLocations = ko.computed(function () {
  let query = this.query().toLowerCase();

  if(query) {
    return ko.utils.arrayFilter(data.locations(), function (location) {
      if(location.title.toLowerCase().indexOf(query) >= 0) {
        location.marker.setVisible(true);
        return true;
      } else {
        location.marker.setVisible(false);
        return false;
      }
    });
  } else {
    viewModel.showMarkers();
    return data.locations();
  }
}, viewModel);

ko.applyBindings(viewModel);