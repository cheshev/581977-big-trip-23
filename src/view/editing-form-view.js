import {CITY_NAMES, TRIP_TYPES} from '../const.js';
import {capitalizeFirstLetter, DateTimeFormats, getFormattedDate} from '../utils.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function createEditingFormTemplate(waypoint, destinations, offers) {
  const {basePrice, dateFrom, dateTo, destination, type} = waypoint;
  const currentDestination = destinations.find((item) => item.id === destination);
  const {description} = currentDestination;
  const typeOffers = offers.find((offer) => offer.type === type);
  const pointOffers = typeOffers ? typeOffers.offers.filter((typeOffer) => waypoint.offers.includes(typeOffer.id)) : [];
  const createTripTypesTemplate = () => TRIP_TYPES.map((tripType) => `<div class="event__type-item">
                          <input id="event-type-${tripType.toLowerCase()}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${tripType.toLowerCase()}">
                          <label class="event__type-label  event__type-label--${tripType.toLowerCase()}" for="event-type-${tripType.toLowerCase()}-1">${tripType}</label>
                        </div>`).join('');
  const createCityNamesTemplate = () => CITY_NAMES.map((cityName) => `<option value="${cityName}"></option>`).join('');
  const createOffersTemplate = () => typeOffers.offers.length === 0 ? '' : `<section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                    <div class="event__available-offers">
                      ${typeOffers.offers.map((offer) => `<div class="event__offer-selector">
                        <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}-1" data-id="${offer.id}" type="checkbox" name="event-offer-${offer.id}" ${(pointOffers.some((item)=> item.id === offer.id) ? 'checked' : '')}>
                        <label class="event__offer-label" for="event-offer-${offer.id}-1">
                          <span class="event__offer-title">${offer.title}</span>
                          &plus;&euro;&nbsp;
                          <span class="event__offer-price">${offer.price}</span>
                        </label>
                      </div>`).join('')}
                    </div>
                  </section>`;
  const createDescriptionTemplate = () => description ? `<section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${description}</p>
                  </section>` : '';
  const typesTemplate = createTripTypesTemplate();
  const cityNamesTemplate = createCityNamesTemplate();
  const offersTemplate = createOffersTemplate();
  const formattedDates = {
    start: getFormattedDate(dateFrom, DateTimeFormats.DATETIME),
    end: getFormattedDate(dateTo, DateTimeFormats.DATETIME)
  };
  const descriptionTemplate = createDescriptionTemplate();

  return (`            <li class="trip-events__item">
              <form class="event event--edit" action="#" method="post">
                <header class="event__header">
                  <div class="event__type-wrapper">
                    <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                    </label>
                    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

                    <div class="event__type-list">
                      <fieldset class="event__type-group">
                        <legend class="visually-hidden">Event type</legend>
                        ${typesTemplate}
                      </fieldset>
                    </div>
                  </div>

                  <div class="event__field-group  event__field-group--destination">
                    <label class="event__label  event__type-output" for="event-destination-1">
                      ${capitalizeFirstLetter(type)}
                    </label>
                    <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination.name}" list="destination-list-1">
                    <datalist id="destination-list-1">
                      ${cityNamesTemplate}
                    </datalist>
                  </div>

                  <div class="event__field-group  event__field-group--time">
                    <label class="visually-hidden" for="event-start-time-1">From</label>
                    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formattedDates.start}">
                    &mdash;
                    <label class="visually-hidden" for="event-end-time-1">To</label>
                    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formattedDates.end}">
                  </div>

                  <div class="event__field-group  event__field-group--price">
                    <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                    </label>
                    <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
                  </div>

                  <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
                  <button class="event__reset-btn" type="reset">Delete</button>
                  <button class="event__rollup-btn" type="button">
                    <span class="visually-hidden">Open event</span>
                  </button>
                </header>
                <section class="event__details">
                  ${offersTemplate}
                  ${descriptionTemplate}
                </section>
              </form>
            </li>`);
}

export default class EditingFormView extends AbstractStatefulView{
  #destinations = null;
  #offers = null;
  #handleFormSubmit = null;
  #datepicker = null;

  constructor({waypoint, destinations, offers, onFormSubmit}) {
    super();
    this._setState(EditingFormView.parseWaypointToState(waypoint));
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormSubmit = onFormSubmit;

    this._restoreHandlers();
  }

  reset(waypoint) {
    this.updateElement(
      EditingFormView.parseWaypointToState(waypoint),
    );
  }

  removeElement() {
    super.removeElement();

    if (this.#datepicker) {
      this.#datepicker.destroy();
      this.#datepicker = null;
    }
  }

  _restoreHandlers() {
    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#typeClickHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationInputHandler);

    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);

    this.element.querySelector('.event__details').addEventListener('change', this.#offerInputHandler);

    this.#setDatepickerFrom();
    this.#setDatepickerTo();
  }

  get template() {
    return createEditingFormTemplate(this._state, this.#destinations, this.#offers);
  }

  static parseWaypointToState(waypoint) {
    return {...waypoint};
  }

  static parseStateToWaypoint(state) {
    return {...state};
  }

  #dateFromChangeHandler = ([userDate]) => {
    this.updateElement({
      dateFrom: userDate,
    });
  };

  #dateToChangeHandler = ([userDate]) => {
    this.updateElement({
      dateTo: userDate,
    });
  };

  #setDatepickerFrom() {
    this.#datepicker = flatpickr(
      this.element.querySelector('input[name="event-start-time"]'),
      {
        enableTime: true,
        dateFormat: 'Y/m/d H:i',
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
      }
    );
  }

  #setDatepickerTo() {
    this.#datepicker = flatpickr(
      this.element.querySelector('input[name="event-end-time"]'),
      {
        enableTime: true,
        dateFormat: 'Y/m/d H:i',
        defaultDate: this._state.dateTo,
        onChange: this.#dateToChangeHandler,
      }
    );
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(EditingFormView.parseStateToWaypoint(this._state));
  };

  #typeClickHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value
    });
  };

  #destinationInputHandler = (evt) => {
    evt.preventDefault();
    const selectedDestination = this.#destinations.find((item) => item.name === evt.target.value);

    if (selectedDestination) {
      this.updateElement({
        destination: selectedDestination.id
      });
    }
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      basePrice: evt.target.value
    });
  };

  #offerInputHandler = (evt) => {
    evt.preventDefault();
    if (this._state.offers.some((item) => item === evt.target.dataset.id)) {
      this.updateElement({
        offers: this._state.offers.filter((item) => item !== evt.target.dataset.id)
      });
    } else {
      this.updateElement({
        offers: this._state.offers.concat([evt.target.dataset.id])
      });
    }
  };
}
