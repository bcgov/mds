
package pages

import geb.Page

class HomePage extends Page
{
    static at = { title == "React App" }
    static content = {
        clickMeButton (wait: true) {$("button", class:"ant-btn btn-center ant-btn-primary ant-btn-lg")}
        toastMessage (wait: true) {$("div", class:"ant-notification-notice-message").text()}
    
    
    }
}