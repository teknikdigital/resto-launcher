// Setup Font Awesome untuk Next.js: matikan auto-inject CSS agar tidak FOUC.
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;
