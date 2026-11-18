// TV browsers run older Chromium (LG webOS 6: Chrome 79). The build lowers
// syntax (scripts/build-tv.mjs); these fill the newer built-ins the app and its
// libraries call. core-js changes nothing where a browser already has them.
import 'core-js/actual/array/at';
import 'core-js/actual/string/at';
import 'core-js/actual/object/has-own';
import 'core-js/actual/string/replace-all';
import 'core-js/actual/array/find-last';
import 'core-js/actual/array/find-last-index';
