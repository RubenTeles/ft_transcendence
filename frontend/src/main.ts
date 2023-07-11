import "./assets/styles/main.css";
import '@/scss/styles.scss';
// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap';
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import Router from "./router";
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faWarning } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faWarning)

const app = createApp(App);

// Removendo o menu de contexto em toda a aplicação
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

app.use(createPinia());
app.use(Router.getRouter());
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount("#app");

// import 'bootstrap/dist/js/bootstrap.js'