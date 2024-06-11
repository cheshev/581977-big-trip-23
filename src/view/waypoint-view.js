import AbstractView from '../framework/view/abstract-view.js';
import {DateTimeFormats, getDatesDiff, getFormattedDate} from '../utils.js';

function createWaypointTemplate(waypoint, destinations, offers) {
  const {basePrice, dateFrom, dateTo, destination, type, isFavorite} = waypoint;
  const currentDestination = destinations.find((item) => item.id === destination);
  //const {name} = currentDestination;
  const typeOffers = offers.find((offer) => offer.type === type);
  const pointOffers = typeOffers ? typeOffers.offers.filter((typeOffer) => waypoint.offers.includes(typeOffer.id)) : [];
  const createOffersTemplate = () => pointOffers.length === 0 ? '' : pointOffers.map((offer) => `<li class="event__offer">
                    <span class="event__offer-title">${offer.title}</span>
                    &plus;&euro;&nbsp;
                    <span class="event__offer-price">${offer.price}</span>
                  </li>`).join('');
  const offersTemplate = createOffersTemplate();
  const formattedDates = {
    startDate: getFormattedDate(dateFrom, DateTimeFormats.DATE),
    endDate: getFormattedDate(dateTo, DateTimeFormats.DATE),
    startMonthDay: getFormattedDate(dateFrom, DateTimeFormats.MONTHDAY).toUpperCase(),
    startTime: getFormattedDate(dateFrom, DateTimeFormats.TIME),
    endTime: getFormattedDate(dateTo, DateTimeFormats.TIME),
    daysDiff: getDatesDiff(dateFrom, dateTo)
  };

  return (`<li class="trip-events__item">
              <div class="event">
                <time class="event__date" datetime="${formattedDates.startDate}">${formattedDates.startMonthDay}</time>
                <div class="event__type">
                  <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
                </div>
                <h3 class="event__title">${type} ${currentDestination ? currentDestination.name : ''}</h3>
                <div class="event__schedule">
                  <p class="event__time">
                    <time class="event__start-time" datetime="${formattedDates.startDate}T${formattedDates.startTime}">${formattedDates.startTime}</time>
                    &mdash;
                    <time class="event__end-time" datetime="${formattedDates.endDate}T${formattedDates.endTime}">${formattedDates.endTime}</time>
                  </p>
                  <p class="event__duration">${formattedDates.daysDiff}D</p>
                </div>
                <p class="event__price">
                  &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
                </p>
                <h4 class="visually-hidden">Offers:</h4>
                <ul class="event__selected-offers">
                  ${offersTemplate}
                </ul>
                <button class="event__favorite-btn ${isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
                  <span class="visually-hidden">Add to favorite</span>
                  <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                    <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
                  </svg>
                </button>
                <button class="event__rollup-btn" type="button">
                  <span class="visually-hidden">Open event</span>
                </button>
              </div>
            </li>`);
}

export default class WaypointView extends AbstractView{
  #waypoint = null;
  #destinations = null;
  #offers = null;
  #handleEditClick = null;
  #handleFavoriteClick = null;

  constructor({waypoint, destinations, offers, onEditClick, onFavoriteClick}) {
    super();
    this.#waypoint = waypoint;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleEditClick = onEditClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editClickHandler);
    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createWaypointTemplate(this.#waypoint, this.#destinations, this.#offers);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };
}
