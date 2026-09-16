(function () {
    let lightSwitch = document.getElementById("lightSwitch");
    if (!lightSwitch) {
        return;
    }

    function darkMode() {
        document.body.classList.remove("bg-light", "text-dark");
        document.body.classList.add("bg-dark", "text-light");

        let hactive = document.getElementById("Header Navigation active");
        let hlink1 = document.getElementById("Header Navigation link 1");
        let hlink2 = document.getElementById("Header Navigation link 2");
        let hlink3 = document.getElementById("Header Navigation link 3");
        let hlink4 = document.getElementById("Header Navigation link 4");

        let factive = document.getElementById("Footer Navigation active");
        let flink1 = document.getElementById("Footer Navigation link 1");
        let flink2 = document.getElementById("Footer Navigation link 2");
        let flink3 = document.getElementById("Footer Navigation link 3");
        let flink4 = document.getElementById("Footer Navigation link 4");

        let hhover = document.getElementById("Header Navigation hover");
        let fhover = document.getElementById("Footer Navigation hover");

        let container = document.getElementById("container");

        hhover.classList.remove("nav-hover-light");
        hhover.classList.add("nav-hover-dark");

        fhover.classList.remove("nav-hover-light");
        fhover.classList.add("nav-hover-dark");

        hactive.classList.remove("nav-active-light");
        hactive.classList.add("nav-active-dark");

        hlink1.classList.remove("nav-link-light");
        hlink1.classList.add("nav-link-dark");

        hlink2.classList.remove("nav-link-light");
        hlink2.classList.add("nav-link-dark");

        hlink3.classList.remove("nav-link-light");
        hlink3.classList.add("nav-link-dark");

        hlink4.classList.remove("nav-link-light");
        hlink4.classList.add("nav-link-dark");

        factive.classList.remove("nav-active-light");
        factive.classList.add("nav-active-dark");

        flink1.classList.remove("nav-link-light");
        flink1.classList.add("nav-link-dark");

        flink2.classList.remove("nav-link-light");
        flink2.classList.add("nav-link-dark");

        flink3.classList.remove("nav-link-light");
        flink3.classList.add("nav-link-dark");

        flink4.classList.remove("nav-link-light");
        flink4.classList.add("nav-link-dark");

        container.classList.remove("container-light");
        container.classList.add("container-dark");

        lightSwitch.checked = true;
        localStorage.setItem("lightSwitch", "dark");
    }

    function lightMode() {
        document.body.classList.remove("bg-dark", "text-light");
        document.body.classList.add("bg-light", "text-dark");

        let hactive = document.getElementById("Header Navigation active");
        let hlink1 = document.getElementById("Header Navigation link 1");
        let hlink2 = document.getElementById("Header Navigation link 2");
        let hlink3 = document.getElementById("Header Navigation link 3");
        let hlink4 = document.getElementById("Header Navigation link 4");
        
        let factive = document.getElementById("Footer Navigation active");
        let flink1 = document.getElementById("Footer Navigation link 1");
        let flink2 = document.getElementById("Footer Navigation link 2");
        let flink3 = document.getElementById("Footer Navigation link 3");
        let flink4 = document.getElementById("Footer Navigation link 4");

        let hhover = document.getElementById("Header Navigation hover");
        let fhover = document.getElementById("Footer Navigation hover");

        let container = document.getElementById("container");

        hhover.classList.remove("nav-hover-dark");
        hhover.classList.add("nav-hover-light");

        fhover.classList.remove("nav-hover-dark");
        fhover.classList.add("nav-hover-light");

        hactive.classList.remove("nav-active-dark");
        hactive.classList.add("nav-active-light");

        hlink1.classList.remove("nav-link-dark");
        hlink1.classList.add("nav-link-light");

        hlink2.classList.remove("nav-link-dark");
        hlink2.classList.add("nav-link-light");

        hlink3.classList.remove("nav-link-dark");
        hlink3.classList.add("nav-link-light");

        hlink4.classList.remove("nav-link-dark");
        hlink4.classList.add("nav-link-light");

        factive.classList.remove("nav-active-dark");
        factive.classList.add("nav-active-light");

        flink1.classList.remove("nav-link-dark");
        flink1.classList.add("nav-link-light");

        flink2.classList.remove("nav-link-dark");
        flink2.classList.add("nav-link-light");

        flink3.classList.remove("nav-link-dark");
        flink3.classList.add("nav-link-light");

        flink4.classList.remove("nav-link-dark");
        flink4.classList.add("nav-link-light");

        container.classList.remove("container-dark");
        container.classList.add("container-light");

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

        if (settings === "dark") {
            lightSwitch.checked = true;
        }

        lightSwitch.addEventListener("change", onToggleMode);
        onToggleMode();
    }

    setup();
})();