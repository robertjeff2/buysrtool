import { createSSRApp } from "vue";
import App from "./App.vue";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

export function createApp() {
  const app = createSSRApp(App);
  app.use(ElementPlus);
  return {
    app,
  };
}
