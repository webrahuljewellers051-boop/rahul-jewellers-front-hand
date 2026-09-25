import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Activity,
  ArrowDown,
  ArrowUp,
  Wifi,
  WifiOff,
} from 'lucide-react';

import './LiveGoldNavbar.css';

/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
*/

/*
 * Gold API
 *
 * Returns XAU gold price in USD per troy ounce.
 */
const GOLD_API =
  'https://api.gold-api.com/price/XAU';

/*
 * Frankfurter
 *
 * Returns USD -> INR exchange rate.
 */
const USD_INR_API =
  'https://api.frankfurter.dev/v2/rate/USD/INR';

/*
 * 1 troy ounce = 31.1034768 grams
 */
const TROY_OUNCE_GRAMS =
  31.1034768;


/*
|--------------------------------------------------------------------------
| FORMAT PRICE
|--------------------------------------------------------------------------
*/

function formatINR(value) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `₹${Math.round(
    value
  ).toLocaleString('en-IN')}`;
}


/*
|--------------------------------------------------------------------------
| EXTRACT GOLD PRICE
|--------------------------------------------------------------------------
*/

function getGoldPrice(data) {
  /*
   * Gold API normally returns:
   *
   * {
   *   price: 4350.60,
   *   symbol: "XAU"
   * }
   */

  const value =
    data?.price ??
    data?.value ??
    data?.data?.price;

  const number =
    Number(value);

  if (
    Number.isFinite(number) &&
    number > 0
  ) {
    return number;
  }

  return null;
}


/*
|--------------------------------------------------------------------------
| EXTRACT USD/INR
|--------------------------------------------------------------------------
*/

function getUsdInr(data) {
  /*
   * Frankfurter v2 response:
   *
   * {
   *   date: "...",
   *   base: "USD",
   *   quote: "INR",
   *   rate: 88.xx
   * }
   */

  const value =
    data?.rate;

  const number =
    Number(value);

  if (
    Number.isFinite(number) &&
    number > 0
  ) {
    return number;
  }

  return null;
}


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function LiveGoldNavbar() {

  const [price, setPrice] =
    useState(null);

  const [direction, setDirection] =
    useState(0);

  const [connected, setConnected] =
    useState(false);

  const [status, setStatus] =
    useState(
      'Loading gold rate...'
    );

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const timerRef =
    useRef(null);

  const previousPriceRef =
    useRef(null);


  /*
  |--------------------------------------------------------------------------
  | FETCH GOLD RATE
  |--------------------------------------------------------------------------
  */

  const fetchGoldRate =
    useCallback(async () => {

      try {

        setStatus(
          'Updating gold rate...'
        );


        /*
         * Fetch both:
         *
         * 1. XAU/USD
         * 2. USD/INR
         */

        const [
          goldResponse,
          exchangeResponse,
        ] = await Promise.all([

          fetch(
            `${GOLD_API}?_=${Date.now()}`,
            {
              method: 'GET',
              cache: 'no-store',
            }
          ),

          fetch(
            `${USD_INR_API}?_=${Date.now()}`,
            {
              method: 'GET',
              cache: 'no-store',
            }
          ),

        ]);


        /*
         * Check Gold API
         */

        if (
          !goldResponse.ok
        ) {
          throw new Error(
            `Gold API HTTP ${goldResponse.status}`
          );
        }


        /*
         * Check Exchange API
         */

        if (
          !exchangeResponse.ok
        ) {
          throw new Error(
            `Exchange API HTTP ${exchangeResponse.status}`
          );
        }


        /*
         * Convert responses to JSON
         */

        const goldData =
          await goldResponse.json();

        const exchangeData =
          await exchangeResponse.json();


        console.log(
          'Gold API:',
          goldData
        );

        console.log(
          'USD/INR API:',
          exchangeData
        );


        /*
         * Get XAU/USD
         */

        const goldUsd =
          getGoldPrice(
            goldData
          );


        /*
         * Get USD/INR
         */

        const usdInr =
          getUsdInr(
            exchangeData
          );


        if (!goldUsd) {
          throw new Error(
            'Gold API returned an invalid price'
          );
        }


        if (!usdInr) {
          throw new Error(
            'USD/INR API returned an invalid rate'
          );
        }


        /*
        |--------------------------------------------------------------------------
        | CALCULATE 24K GOLD
        |--------------------------------------------------------------------------
        |
        | XAU/USD
        |       ↓
        | USD per troy ounce
        |
        | × USD/INR
        |       ↓
        | INR per troy ounce
        |
        | ÷ 31.1034768
        |       ↓
        | INR per gram
        |
        */

        const pricePerGram =
          (
            goldUsd *
            usdInr
          ) /
          TROY_OUNCE_GRAMS;


        if (
          !Number.isFinite(
            pricePerGram
          ) ||
          pricePerGram <= 0
        ) {
          throw new Error(
            'Calculated gold price is invalid'
          );
        }


        /*
        |--------------------------------------------------------------------------
        | PRICE MOVEMENT
        |--------------------------------------------------------------------------
        */

        const previous =
          previousPriceRef.current;


        if (
          Number.isFinite(
            previous
          )
        ) {

          if (
            pricePerGram >
            previous
          ) {

            setDirection(1);

          } else if (
            pricePerGram <
            previous
          ) {

            setDirection(-1);

          } else {

            setDirection(0);

          }

        }


        previousPriceRef.current =
          pricePerGram;


        /*
        |--------------------------------------------------------------------------
        | UPDATE UI
        |--------------------------------------------------------------------------
        */

        setPrice(
          pricePerGram
        );

        setConnected(
          true
        );

        setStatus(
          'LIVE GOLD FEED'
        );

        setLastUpdated(
          new Date()
        );


        console.log(
          '--------------------------------'
        );

        console.log(
          '24K GOLD'
        );

        console.log(
          'XAU/USD:',
          goldUsd
        );

        console.log(
          'USD/INR:',
          usdInr
        );

        console.log(
          '24K INR/GRAM:',
          pricePerGram
        );

        console.log(
          '--------------------------------'
        );

      } catch (error) {

        console.error(
          'Gold rate error:',
          error
        );

        setConnected(
          false
        );

        setStatus(
          'Gold feed unavailable'
        );

      }

    }, []);


  /*
  |--------------------------------------------------------------------------
  | START LIVE UPDATES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    /*
     * Get rate immediately.
     */

    fetchGoldRate();


    /*
     * Refresh every 10 seconds.
     *
     * Gold API documents its real-time
     * price endpoint as free and CORS-enabled.
     */

    timerRef.current =
      window.setInterval(
        fetchGoldRate,
        10000
      );


    /*
     * Cleanup
     */

    return () => {

      window.clearInterval(
        timerRef.current
      );

    };

  }, [fetchGoldRate]);


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div
      className="gold-rate-bar"
      role="status"
      aria-label="Live 24K gold rate"
    >

      <div className="gold-rate-marquee">

        <div className="gold-rate-content">


          {/* =========================================================
              LIVE GOLD RATE
          ========================================================== */}

          <div className="gold-rate-brand">

            <span
              className={`gold-live-dot ${
                connected
                  ? 'is-live'
                  : ''
              }`}
            />

            <span>
              LIVE GOLD RATE
            </span>

          </div>


          <span className="gold-separator" />


          {/* =========================================================
              ONLY 24K
          ========================================================== */}

          <div className="gold-rate-item">

            <span className="gold-purity">
              24K
            </span>

            <strong>
              {formatINR(
                price
              )}
            </strong>

            <span className="gold-unit">
              /g
            </span>

          </div>


          <span className="gold-separator" />


          {/* =========================================================
              MOVEMENT
          ========================================================== */}

          <div
            className={`gold-movement ${
              direction > 0
                ? 'up'
                : direction < 0
                ? 'down'
                : ''
            }`}
          >

            {direction > 0 ? (

              <ArrowUp
                size={14}
              />

            ) : direction < 0 ? (

              <ArrowDown
                size={14}
              />

            ) : (

              <Activity
                size={14}
              />

            )}

            <span>

              {direction > 0
                ? 'RISING'
                : direction < 0
                ? 'FALLING'
                : 'LIVE MARKET'}

            </span>

          </div>


          <span className="gold-separator" />


          {/* =========================================================
              CONNECTION
          ========================================================== */}

          <div
            className={`gold-connection ${
              connected
                ? 'online'
                : 'offline'
            }`}
          >

            {connected ? (

              <Wifi
                size={14}
              />

            ) : (

              <WifiOff
                size={14}
              />

            )}

            <span>

              {connected
                ? 'LIVE'
                : 'OFFLINE'}

            </span>

          </div>


          {/* =========================================================
              LAST UPDATE
          ========================================================== */}

          <span className="gold-update">

            {lastUpdated

              ? `Updated ${lastUpdated.toLocaleTimeString(
                  'en-IN'
                )}`

              : status}

          </span>

        </div>

      </div>

    </div>

  );
}