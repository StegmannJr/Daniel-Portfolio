document.getElementById("currentYear").innerText = new Date().getFullYear();
ageCalculator("2008-10-16", "DanielAge");

function ageCalculator(birth, id) {
    var dob = new Date(birth);

    var month_diff = Date.now() - dob.getTime();
    
    var age_dt = new Date(month_diff);
    
    var year = age_dt.getUTCFullYear();
    
    var age = Math.abs(year - 1970);
    
    const element = document.getElementById(id);
    element.innerText = age;
}

(function () {
    let lightSwitch = document.getElementById("lightSwitch");
    if (!lightSwitch) {
        return;
    }

    function darkMode() {
        document.body.classList.remove("bg-light", "text-dark");
        document.body.classList.add("bg-dark", "text-light");

        lightSwitch.checked = true;
        localStorage.setItem("lightSwitch", "dark");
    }

    function lightMode() {
        document.body.classList.remove("bg-dark", "text-light");
        document.body.classList.add("bg-light", "text-dark");

        lightSwitch.checked = false;
        localStorage.setItem("lightSwitch", "light");
    }

    function onToggleMode() {
        lightSwitch.checked ? darkMode() : lightMode();
    }

    function getSystemDefaultTheme() {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        if (darkThemeMq.matches) {
            return "dark";
        }
        return "light";
    }

    function setup() {
        var settings = localStorage.getItem("lightSwitch");
        if (settings == null) {
            settings = getSystemDefaultTheme();
        }

        if (settings = "dark") {
            lightSwitch.checked = true;
        }

        lightSwitch.addEventListener("change", onToggleMode);
        onToggleMode();
    }

    setup();
})();