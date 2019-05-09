package modules

import geb.Module 

class Tab_Map_Module extends Module {
    static at = {activeTab=='Map'}
    static content = {
        activeTab (wait:true) {$("div.ant-tabs-tab-active").text()}
        mapTab (wait:true) {$("div.ant-tabs-tab", text: "Map")}
    }  
} 
        