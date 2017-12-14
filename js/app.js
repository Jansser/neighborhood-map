/*
* Locations dataset
*/
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

/**
* @description Represents a Location
* @constructor
* @param {string} title - The title of the location.
* @param {object} coordinates - Object with the lat and long of the object.
*/
function Location(title, coordinates) {
  let self = this;
  self.title = title;
  self.coordinates = coordinates;

  /*
  * Loads the foursquare API data
  */
  self.getFoursquareData = function () {
    const FORSQUARE_CLIENT_ID = 'XU0HWTQITZBSMD2HJDPOKQTYRFBVWPCY4QAM03KG0LKVVSS2';
    const FORSQUARE_CLIENT_SECRET = 'KWFQ22SUYMKL4JYPKJMT5CKHZRNZJPWBRLN5FDL52FKGO5MU';

    let url = 'https://api.foursquare.com/v2/venues/search?v=20171112' +
      '&ll=' + self.coordinates.lat + ',' + self.coordinates.lng +
      '&query=' + self.title +
      '&client_id=' + FORSQUARE_CLIENT_ID +
      '&client_secret=' + FORSQUARE_CLIENT_SECRET +
      '&limit=1';

    $.getJSON(url).done(function(response) {
      let venues = response.response.venues;

      if(venues && venues.length) {
        info = venues[0];

        if(info) {
          self.address  = info.location.formattedAddress.join(', ');
          self.category = info.categories[0].shortName;
        }
      }
    }).fail(function () {
      viewModel.showError('Sorry, we couldn\'t load foursquare data');
    });
  }

  this.getFoursquareData();
}

var viewModel = {
  query: ko.observable(""),
  map,
  infoWindow: null,
  initMap: function () {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: -12.9730401, lng: -38.5023039 },
      zoom: 16,
      styles: [{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},
        {"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},
        {"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels",
        "stylers":[{"visibility":"simplified"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry",
        "stylers":[{"hue":"#f49935"}]},{"featureType":"road.highway","elementType":"labels",
        "stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry",
        "stylers":[{"hue":"#fad959"}]},{"featureType":"road.arterial","elementType":"labels",
        "stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry",
        "stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"labels",
        "stylers":[{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all",
        "stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all",
        "stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]}
      ]
    });

    this.infoWindow = new google.maps.InfoWindow();
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
        icon: 'images/burger.png',
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
    let infoWindow = this.infoWindow;
    let marker = location.marker;

    if(infoWindow.marker != marker) {
      infoWindow.setContent('');
      infoWindow.marker = marker;

      let content =
      '<div class="card border-0">'
        + '<div class="card-body">'
          + '<h5 class="card-title">' + marker.title + '</h5>';

          if(location.category) {
            content = content + '<h6 class="card-subtitle mb-2 text-muted">' + location.category + '</h6>'
            + '<ul class="list-group list-group-flush">'
              + '<li class="list-group-item"><strong>Address</strong></li>'
              + '<li class="list-group-item text-left">' + location.address + '</li>'
            + '</ul>'
            + '<img src="images/foursquare_logo.png" class="float-right">';
          }

        content = content + '</div>'
      + '</div>';

      infoWindow.setContent(content);
      infoWindow.open(viewModel.map, marker);
    }
  },

  highlightLocation: function (location) {
    let marker = location.marker;

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

  showError: function(message) {
    swal('Oops...', message,'error');
  }
};

/*
 * Filtering the list of locations.
 */
viewModel.filteredLocations = ko.computed(function () {
  let query = this.query().toLowerCase();

  if(viewModel.infoWindow) {
    viewModel.infoWindow.close();
  }

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