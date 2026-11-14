import headphones from "../assets/products/headphones.webp";
import lamp from "../assets/products/lamp.webp";
import mug from "../assets/products/mug.webp";
import watch from "../assets/products/watch.webp";
import backpack from "../assets/products/backpack.webp";
import fieldWatch38Mm from "../assets/products/field-watch-38-mm.webp";
import diverWatchSteel from "../assets/products/diver-watch-steel.webp";
import minimalQuartzWatch from "../assets/products/minimal-quartz-watch.webp";
import chronographLeatherStrap from "../assets/products/chronograph-leather-strap.webp";
import kidsDigitalWatch from "../assets/products/kids-digital-watch.webp";
import leatherWatchStrap20Mm from "../assets/products/leather-watch-strap-20-mm.webp";
import watchWinderBox from "../assets/products/watch-winder-box.webp";
import canvasTote from "../assets/products/canvas-tote.webp";
import leatherWallet from "../assets/products/leather-wallet.webp";
import weekenderDuffel from "../assets/products/weekender-duffel.webp";
import laptopSleeve14Inch from "../assets/products/laptop-sleeve-14-inch.webp";
import crossbodySling from "../assets/products/crossbody-sling.webp";
import cardHolder from "../assets/products/card-holder.webp";
import hikingDaypack28L from "../assets/products/hiking-daypack-28-l.webp";
import budgetSmartphone128Gb from "../assets/products/budget-smartphone-128-gb.webp";
import flagshipSmartphone256Gb from "../assets/products/flagship-smartphone-256-gb.webp";
import wirelessEarbuds from "../assets/products/wireless-earbuds.webp";
import clearPhoneCase from "../assets/products/clear-phone-case.webp";
import img_65WUsbCCharger from "../assets/products/65-w-usb-c-charger.webp";
import powerBank10000Mah from "../assets/products/power-bank-10-000-mah.webp";
import bluetoothSpeaker from "../assets/products/bluetooth-speaker.webp";
import pourOverCoffeeSet from "../assets/products/pour-over-coffee-set.webp";
import linenThrowBlanket from "../assets/products/linen-throw-blanket.webp";
import castIronSkillet26Cm from "../assets/products/cast-iron-skillet-26-cm.webp";
import scentedCandle from "../assets/products/scented-candle.webp";

// Bundled product pictures by name, from Unsplash (see
// src/assets/products/CREDITS.md). Saved data refers to them by name, since
// the URLs change with every build (see app/persist.ts).
export const SEED_IMAGES = {
  headphones,
  lamp,
  mug,
  watch,
  backpack,
  "field-watch-38-mm": fieldWatch38Mm,
  "diver-watch-steel": diverWatchSteel,
  "minimal-quartz-watch": minimalQuartzWatch,
  "chronograph-leather-strap": chronographLeatherStrap,
  "kids-digital-watch": kidsDigitalWatch,
  "leather-watch-strap-20-mm": leatherWatchStrap20Mm,
  "watch-winder-box": watchWinderBox,
  "canvas-tote": canvasTote,
  "leather-wallet": leatherWallet,
  "weekender-duffel": weekenderDuffel,
  "laptop-sleeve-14-inch": laptopSleeve14Inch,
  "crossbody-sling": crossbodySling,
  "card-holder": cardHolder,
  "hiking-daypack-28-l": hikingDaypack28L,
  "budget-smartphone-128-gb": budgetSmartphone128Gb,
  "flagship-smartphone-256-gb": flagshipSmartphone256Gb,
  "wireless-earbuds": wirelessEarbuds,
  "clear-phone-case": clearPhoneCase,
  "65-w-usb-c-charger": img_65WUsbCCharger,
  "power-bank-10-000-mah": powerBank10000Mah,
  "bluetooth-speaker": bluetoothSpeaker,
  "pour-over-coffee-set": pourOverCoffeeSet,
  "linen-throw-blanket": linenThrowBlanket,
  "cast-iron-skillet-26-cm": castIronSkillet26Cm,
  "scented-candle": scentedCandle,
} as const satisfies Record<string, string>;

export type SeedImageName = keyof typeof SEED_IMAGES;
