import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo(page = '') {
    const newUrl = browser.baseUrl + page;
    console.log(`Navigated to new Url ${newUrl}`);
    return browser.get(newUrl) as Promise<any>;
  }

  querySelector(selector: string) {
    return element(by.css(selector));
  }

  getSignInText() {
    return this.querySelector('app-root .form-login h1').getText() as Promise<string>;
  }
}
